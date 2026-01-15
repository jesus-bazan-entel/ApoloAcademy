import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Video, FileText, CheckCircle, Play, Download, BookOpen, ChevronLeft, HelpCircle } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';

const CourseContent = () => {
    const { showNotification, NotificationComponent } = useNotification();
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [currentSectionId, setCurrentSectionId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completedLessons, setCompletedLessons] = useState([]);

    useEffect(() => {
        fetchCourseContent();
    }, [courseId]);

    const fetchCourseContent = async () => {
        setLoading(true);

        const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('*, profiles(full_name)')
            .eq('id', courseId)
            .single();

        if (courseError) {
            showNotification('Error al cargar el curso', 'error');
            navigate('/');
            return;
        }

        const { data: sectionsData, error: sectionsError } = await supabase
            .from('sections')
            .select('*, lessons(*)')
            .eq('course_id', courseId)
            .order('order_index');

        if (sectionsError) {
            showNotification('Error al cargar el contenido', 'error');
        } else {
            setCourse(courseData);
            setSections(sectionsData || []);

            if (sectionsData?.length > 0 && sectionsData[0]?.lessons?.length > 0) {
                const firstLesson = sectionsData[0].lessons.sort((a, b) => a.order_index - b.order_index)[0];
                setCurrentLesson(firstLesson);
                setCurrentSectionId(sectionsData[0].id);
            }
        }

        setLoading(false);
    };

    const handleLessonClick = (lesson, sectionId) => {
        setCurrentLesson(lesson);
        setCurrentSectionId(sectionId);
    };

    const markLessonComplete = async (lessonId) => {
        const studentId = sessionStorage.getItem('userId');
        if (!studentId) {
            showNotification('Debes iniciar sesión para marcar lecciones', 'error');
            return;
        }

        const { error } = await supabase
            .from('lesson_progress')
            .upsert({
                student_id: studentId,
                lesson_id: lessonId,
                completed: true,
                completed_at: new Date().toISOString()
            }, {
                onConflict: 'student_id,lesson_id'
            });

        if (!error) {
            setCompletedLessons(prev => [...prev, lessonId]);
            showNotification('Lección marcada como completada', 'success');
        }
    };

    const getContentTypeIcon = (type) => {
        switch (type) {
            case 'video': return <Video size={16} />;
            case 'pdf': return <FileText size={16} />;
            case 'word': return <FileText size={16} />;
            case 'quiz': return <BookOpen size={16} />;
            default: return <FileText size={16} />;
        }
    };

    const renderLessonContent = () => {
        if (!currentLesson) {
            return (
                <div className="empty-state">
                    <BookOpen size={48} />
                    <p>Selecciona una lección para ver su contenido</p>
                </div>
            );
        }

        switch (currentLesson.content_type) {
            case 'video':
                return (
                    <div className="lesson-content">
                        <h2>{currentLesson.name}</h2>
                        <p className="lesson-desc">{currentLesson.description}</p>

                        {currentLesson.video_url?.includes('youtube.com') || currentLesson.video_url?.includes('youtu.be') ? (
                            <div className="video-viewport">
                                <iframe
                                    src={currentLesson.video_url.replace('watch?v=', 'embed/')}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                />
                            </div>
                        ) : currentLesson.video_url?.includes('vimeo.com') ? (
                            <div className="video-viewport">
                                <iframe
                                    src={currentLesson.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                />
                            </div>
                        ) : (
                            <div className="video-viewport">
                                <video controls style={{ width: '100%', height: '100%' }}>
                                    <source src={currentLesson.video_url} type="video/mp4" />
                                    Tu navegador no soporta videos HTML5.
                                </video>
                            </div>
                        )}

                        <div className="lesson-actions">
                            {!completedLessons.includes(currentLesson.id) && (
                                <button className="btn btn-primary" onClick={() => markLessonComplete(currentLesson.id)}>
                                    <CheckCircle size={16} /> Marcar como completada
                                </button>
                            )}
                            {completedLessons.includes(currentLesson.id) && (
                                <span className="completed-badge">
                                    <CheckCircle size={16} /> Completada
                                </span>
                            )}
                        </div>
                    </div>
                );

            case 'pdf':
                return (
                    <div className="lesson-content">
                        <h2>{currentLesson.name}</h2>
                        <p className="lesson-desc">{currentLesson.description}</p>

                        <div className="pdf-viewer">
                            <iframe
                                src={currentLesson.pdf_url}
                                style={{ width: '100%', height: '600px', border: 'none', borderRadius: 'var(--radius-md)' }}
                            />
                        </div>

                        <div className="lesson-actions">
                            <a href={currentLesson.pdf_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                <Download size={16} /> Descargar PDF
                            </a>
                            {!completedLessons.includes(currentLesson.id) && (
                                <button className="btn btn-outline" onClick={() => markLessonComplete(currentLesson.id)}>
                                    <CheckCircle size={16} /> Marcar como completada
                                </button>
                            )}
                        </div>
                    </div>
                );

            case 'word':
                return (
                    <div className="lesson-content">
                        <h2>{currentLesson.name}</h2>
                        <p className="lesson-desc">{currentLesson.description}</p>

                        <div className="document-preview glass-card">
                            <FileText size={64} />
                            <p className="document-name">Documento Word</p>
                            <a href={currentLesson.word_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                <Download size={16} /> Descargar documento
                            </a>
                        </div>

                        <div className="lesson-actions">
                            {!completedLessons.includes(currentLesson.id) && (
                                <button className="btn btn-outline" onClick={() => markLessonComplete(currentLesson.id)}>
                                    <CheckCircle size={16} /> Marcar como completada
                                </button>
                            )}
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div className="lesson-content">
                        <h2>{currentLesson.name}</h2>
                        <p className="lesson-desc">{currentLesson.description}</p>

                        <div className="text-content glass-card" dangerouslySetInnerHTML={{ __html: currentLesson.content_html }} />

                        <div className="lesson-actions">
                            {!completedLessons.includes(currentLesson.id) && (
                                <button className="btn btn-primary" onClick={() => markLessonComplete(currentLesson.id)}>
                                    <CheckCircle size={16} /> Marcar como completada
                                </button>
                            )}
                        </div>
                    </div>
                );

            case 'quiz':
                return (
                    <div className="lesson-content">
                        <h2>{currentLesson.name}</h2>
                        <p className="lesson-desc">{currentLesson.description}</p>

                        <div className="quiz-preview glass-card">
                            <HelpCircle size={64} />
                            <p>Examen disponible para esta lección</p>
                            <button className="btn btn-primary">
                                <Play size={16} /> Iniciar Examen
                            </button>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="empty-state">
                        <FileText size={48} />
                        <p>Tipo de contenido no soportado</p>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="loading-page">
                <p>Cargando contenido del curso...</p>
            </div>
        );
    }

    return (
        <>
            <NotificationComponent />
            <div className="course-content-page">
                <header className="page-header">
                    <Link to="/" className="btn btn-outline">
                        <ChevronLeft size={16} /> Volver
                    </Link>
                    <div>
                        <h1>{course?.name}</h1>
                        <p>{course?.description}</p>
                        {course?.profiles && (
                            <p className="teacher-info">
                                👨‍🏫 Profesor: {course.profiles.full_name}
                            </p>
                        )}
                    </div>
                </header>

                <div className="content-layout">
                    <aside className="lessons-sidebar glass-card">
                        <h3>Contenido del Curso</h3>
                        <div className="sections-list">
                            {sections.map((section) => (
                                <div key={section.id} className="section-item">
                                    <h4>{section.name}</h4>
                                    <div className="section-lessons">
                                        {section.lessons
                                            ?.sort((a, b) => a.order_index - b.order_index)
                                            .map((lesson) => (
                                                <button
                                                    key={lesson.id}
                                                    className={`lesson-item ${currentLesson?.id === lesson.id ? 'active' : ''} ${completedLessons.includes(lesson.id) ? 'completed' : ''}`}
                                                    onClick={() => handleLessonClick(lesson, section.id)}
                                                >
                                                    <span className="lesson-icon">
                                                        {getContentTypeIcon(lesson.content_type)}
                                                    </span>
                                                    <span className="lesson-title">{lesson.name}</span>
                                                    {completedLessons.includes(lesson.id) && <CheckCircle size={14} />}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>

                    <main className="lesson-viewport glass-card">
                        {renderLessonContent()}
                    </main>
                </div>
            </div>
        </>
    );
};

export default CourseContent;
