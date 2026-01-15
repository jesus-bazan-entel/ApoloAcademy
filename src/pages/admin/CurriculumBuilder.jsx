import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { generateLessonContent, generateQuizQuestions } from '../../lib/gemini';
import {
    Plus, ChevronDown, ChevronUp, Video, FileText, HelpCircle,
    Sparkles, ArrowLeft, Trash2, Edit2, X, GripVertical, Upload,
    Loader, CheckCircle, AlertCircle, Save
} from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';

const CurriculumBuilder = () => {
    const { showNotification, NotificationComponent } = useNotification();
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const userRole = sessionStorage.getItem('userRole') || 'admin';
    const userId = sessionStorage.getItem('userId');
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});
    const [uploadProgress, setUploadProgress] = useState({});

    // Modales
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [editingLesson, setEditingLesson] = useState(null);
    const [currentSectionId, setCurrentSectionId] = useState(null);

    // File refs
    const videoFileRef = useRef(null);
    const pdfFileRef = useRef(null);

    // Forms
    const [sectionForm, setSectionForm] = useState({ name: '', description: '' });
    const [lessonForm, setLessonForm] = useState({
        name: '',
        description: '',
        content_type: 'video',
        video_url: '',
        pdf_url: '',
        word_url: '',
        content_html: '',
        duration_minutes: '',
        videoFile: null,
        pdfFile: null,
        wordFile: null
    });
    const [filePreviewUrls, setFilePreviewUrls] = useState({
        pdf: null,
        video: null,
        word: null
    });

    const getEmbedUrl = (url) => {
        if (!url) return null;
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
            return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
        }
        
        if (url.includes('vimeo.com')) {
            const videoId = url.match(/vimeo\.com\/(\d+)/);
            return videoId ? `https://player.vimeo.com/video/${videoId[1]}` : null;
        }
        
        return url;
    };

    useEffect(() => {
        fetchCourseAndSections();
    }, [courseId]);

    const fetchCourseAndSections = async () => {
        setLoading(true);

        const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('*, profiles(full_name)')
            .eq('id', courseId)
            .single();

        if (courseError) {
            console.error('Error fetching course:', courseError);
            navigate('/admin/courses');
            return;
        }

        if (userRole === 'author' && courseData.teacher_id !== userId) {
            alert('No tienes permiso para editar este curso');
            navigate('/admin/courses');
            return;
        }

        if (courseData?.profiles) {
            courseData.teacher_name = courseData.profiles.full_name;
            delete courseData.profiles;
        }

        const { data: sectionsData, error: sectionsError } = await supabase
            .from('sections')
            .select('*, lessons(*)')
            .eq('course_id', courseId)
            .order('order_index');

        if (sectionsError) {
            console.error('Error fetching sections:', sectionsError);
        }

        setCourse(courseData);
        setSections(sectionsData || []);

        // Expandir todas las secciones por defecto
        const expanded = {};
        sectionsData?.forEach(s => { expanded[s.id] = true; });
        setExpandedSections(expanded);

        setLoading(false);
    };

    // ========== SUBIDA DE ARCHIVOS ==========
    const uploadFile = async (file, bucket, folder) => {
        if (!file) return null;

        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        setUploadProgress(prev => ({ ...prev, [folder]: 0 }));

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading file:', error);
            showNotification(`Error al subir archivo: ${error.message}`, 'error');
            return null;
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        setUploadProgress(prev => ({ ...prev, [folder]: 100 }));
        return publicUrl;
    };

    // ========== SECCIONES ==========
    const handleOpenSectionModal = (section = null) => {
        if (section) {
            setSectionForm({ name: section.name, description: section.description || '' });
            setEditingSection(section);
        } else {
            setSectionForm({ name: '', description: '' });
            setEditingSection(null);
        }
        setShowSectionModal(true);
    };

    const handleSaveSection = async (e) => {
        e.preventDefault();
        if (!sectionForm.name.trim()) {
            showNotification('El nombre de la sección es requerido', 'error');
            return;
        }

        setSaving(true);

        // Construir objeto de datos solo con campos básicos que seguro existen
        const sectionData = {
            name: sectionForm.name.trim(),
            course_id: courseId,
            order_index: editingSection ? editingSection.order_index : sections.length
        };

        try {
            if (editingSection) {
                // Intentar actualizar con description
                let { error } = await supabase
                    .from('sections')
                    .update({ ...sectionData, description: sectionForm.description.trim() })
                    .eq('id', editingSection.id);

                // Si falla por el campo description, intentar sin él
                if (error && error.message.includes('description')) {
                    const { error: retryError } = await supabase
                        .from('sections')
                        .update(sectionData)
                        .eq('id', editingSection.id);

                    if (retryError) {
                        throw retryError;
                    }
                } else if (error) {
                    throw error;
                }

                showNotification('Sección actualizada correctamente');
            } else {
                // Intentar insertar con description
                let { error } = await supabase
                    .from('sections')
                    .insert([{ ...sectionData, description: sectionForm.description.trim() }]);

                // Si falla por el campo description, intentar sin él
                if (error && error.message.includes('description')) {
                    const { error: retryError } = await supabase
                        .from('sections')
                        .insert([sectionData]);

                    if (retryError) {
                        throw retryError;
                    }
                    showNotification('Sección creada (sin descripción - actualice el schema de la BD)');
                } else if (error) {
                    throw error;
                } else {
                    showNotification('Sección creada correctamente');
                }
            }

            setShowSectionModal(false);
            fetchCourseAndSections();
        } catch (error) {
            console.error('Error saving section:', error);
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSection = async (section) => {
        if (!confirm(`¿Eliminar la sección "${section.name}" y todas sus lecciones?`)) return;

        const { error } = await supabase
            .from('sections')
            .delete()
            .eq('id', section.id);

        if (error) {
            showNotification(`Error al eliminar: ${error.message}`, 'error');
        } else {
            showNotification('Sección eliminada exitosamente', 'success');
            fetchCourseAndSections();
        }
    };

    // ========== LECCIONES ==========
    const handleOpenLessonModal = (sectionId, lesson = null) => {
        setCurrentSectionId(sectionId);
        if (lesson) {
            setLessonForm({
                name: lesson.name || '',
                description: lesson.description || '',
                content_type: lesson.content_type || 'video',
                video_url: lesson.video_url || '',
                pdf_url: lesson.pdf_url || '',
                word_url: lesson.word_url || '',
                content_html: lesson.content_html || '',
                duration_minutes: lesson.duration_minutes?.toString() || '',
                videoFile: null,
                pdfFile: null,
                wordFile: null
            });
            const embedUrl = getEmbedUrl(lesson.video_url);
            setFilePreviewUrls({ 
                pdf: null, 
                video: (embedUrl && embedUrl !== lesson.video_url) ? embedUrl : null,
                word: null 
            });
            setEditingLesson(lesson);
        } else {
            setLessonForm({
                name: '',
                description: '',
                content_type: 'video',
                video_url: '',
                pdf_url: '',
                word_url: '',
                content_html: '',
                duration_minutes: '',
                videoFile: null,
                pdfFile: null,
                wordFile: null
            });
            setFilePreviewUrls({ pdf: null, video: null, word: null });
            setEditingLesson(null);
        }
        setShowLessonModal(true);
    };

    const handleSaveLesson = async (e) => {
        e.preventDefault();
        if (!lessonForm.name.trim()) {
            showNotification('El nombre de la lección es requerido', 'error');
            return;
        }

        setSaving(true);

        try {
            let videoUrl = lessonForm.video_url.trim();
            let pdfUrl = lessonForm.pdf_url.trim();
            let wordUrl = lessonForm.word_url.trim();

            if (lessonForm.content_type === 'video' && lessonForm.videoFile) {
                const uploadedUrl = await uploadFile(lessonForm.videoFile, 'course-materials', 'videos');
                if (uploadedUrl) videoUrl = uploadedUrl;
            }

            if (lessonForm.content_type === 'pdf' && lessonForm.pdfFile) {
                const uploadedUrl = await uploadFile(lessonForm.pdfFile, 'course-materials', 'documents');
                if (uploadedUrl) pdfUrl = uploadedUrl;
            }

            if (lessonForm.content_type === 'word' && lessonForm.wordFile) {
                const uploadedUrl = await uploadFile(lessonForm.wordFile, 'course-materials', 'documents');
                if (uploadedUrl) wordUrl = uploadedUrl;
            }

            const section = sections.find(s => s.id === currentSectionId);
            const lessonData = {
                name: lessonForm.name.trim(),
                description: lessonForm.description.trim(),
                content_type: lessonForm.content_type,
                video_url: lessonForm.content_type === 'video' ? videoUrl : null,
                pdf_url: lessonForm.content_type === 'pdf' ? pdfUrl : null,
                word_url: lessonForm.content_type === 'word' ? wordUrl : null,
                content_html: lessonForm.content_html,
                duration_minutes: lessonForm.duration_minutes ? parseInt(lessonForm.duration_minutes) : 0,
                section_id: currentSectionId,
                order_index: editingLesson ? editingLesson.order_index : (section?.lessons?.length || 0)
            };

            if (editingLesson) {
                const { error } = await supabase
                    .from('lessons')
                    .update(lessonData)
                    .eq('id', editingLesson.id);

                if (error) throw error;
                showNotification('Lección actualizada correctamente');
            } else {
                const { error } = await supabase
                    .from('lessons')
                    .insert([lessonData]);

                if (error) throw error;
                showNotification('Lección creada correctamente');
            }

            setShowLessonModal(false);
            fetchCourseAndSections();
        } catch (error) {
            console.error('Error saving lesson:', error);
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'video') {
                setLessonForm(prev => ({ ...prev, videoFile: file, video_url: file.name }));
                setFilePreviewUrls(prev => ({ ...prev, video: URL.createObjectURL(file) }));
            } else if (type === 'pdf') {
                setLessonForm(prev => ({ ...prev, pdfFile: file, pdf_url: file.name }));
                setFilePreviewUrls(prev => ({ ...prev, pdf: URL.createObjectURL(file) }));
            } else if (type === 'word') {
                setLessonForm(prev => ({ ...prev, wordFile: file, word_url: file.name }));
                setFilePreviewUrls(prev => ({ ...prev, word: URL.createObjectURL(file) }));
            }
        }
    };

    const handleDeleteLesson = async (lesson) => {
        if (!confirm(`¿Eliminar la lección "${lesson.name}"?`)) return;

        const { error } = await supabase
            .from('lessons')
            .delete()
            .eq('id', lesson.id);

        if (error) {
            showNotification(`Error al eliminar: ${error.message}`, 'error');
        } else {
            showNotification('Lección eliminada exitosamente', 'success');
            fetchCourseAndSections();
        }
    };

    // ========== GENERACIÓN CON IA ==========
    const handleAiGenerate = async (sectionId) => {
        const topic = prompt('¿Qué tema deseas generar con IA?');
        if (!topic) return;

        setGenerating(true);

        try {
            const content = await generateLessonContent(topic, 'Academia Pre-universitaria');
            const quiz = await generateQuizQuestions(topic, 'Academia Pre-universitaria');

            const section = sections.find(s => s.id === sectionId);

            const { data: lesson, error } = await supabase
                .from('lessons')
                .insert([{
                    section_id: sectionId,
                    name: `${topic}`,
                    description: `Contenido generado con IA sobre ${topic}`,
                    content_type: 'text',
                    content_html: content,
                    order_index: section?.lessons?.length || 0
                }])
                .select()
                .single();

            if (error) {
                throw error;
            }

            if (lesson && quiz) {
                await supabase.from('quizzes').insert([{
                    lesson_id: lesson.id,
                    questions: quiz
                }]);
            }

            showNotification('¡Lección y quiz generados exitosamente!', 'success');
            fetchCourseAndSections();
        } catch (err) {
            console.error('Error generating content:', err);
            showNotification('Error al generar contenido con IA', 'error');
        } finally {
            setGenerating(false);
        }
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const getContentIcon = (type) => {
        switch (type) {
            case 'video': return <Video size={18} />;
            case 'quiz': return <HelpCircle size={18} />;
            case 'pdf': return <FileText size={18} />;
            case 'word': return <span style={{ fontWeight: 'bold' }}>W</span>;
            default: return <FileText size={18} />;
        }
    };

    if (loading) {
        return (
            <div className="loading-page">
                <p>Cargando curriculum...</p>
            </div>
        );
    }

    return (
        <>
            <NotificationComponent />
            <div className="curriculum-builder animate-fade-in">
            <header className="page-header">
                <button onClick={() => navigate('/admin/courses')} className="btn btn-outline mb-4">
                    <ArrowLeft size={16} /> Volver a Cursos
                </button>
                <div className="flex-between">
                    <div>
                        <h1>{course?.name}</h1>
                        <p>
                            Estructura el contenido de tu curso • {sections.length} secciones
                            {course?.teacher_id && (
                                <span style={{ marginLeft: '1rem', color: 'var(--text-muted)' }}>
                                    Profesor: {course.teacher_name || 'Sin asignar'}
                                </span>
                            )}
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => handleOpenSectionModal()}>
                        <Plus size={20} /> Nueva Sección
                    </button>
                </div>
            </header>

            <div className="sections-list">
                {sections.length === 0 ? (
                    <div className="empty-state glass-card">
                        <FileText size={48} />
                        <p>No hay secciones en este curso</p>
                        <button className="btn btn-primary" onClick={() => handleOpenSectionModal()}>
                            Crear primera sección
                        </button>
                    </div>
                ) : (
                    sections.map((section, index) => (
                        <div key={section.id} className="section-container glass-card">
                            <div
                                className="section-header"
                                onClick={() => toggleSection(section.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="section-title-row">
                                    <GripVertical size={16} className="drag-handle" />
                                    <span className="section-number">{index + 1}</span>
                                    <h3>{section.name}</h3>
                                    <span className="lessons-count">
                                        {section.lessons?.length || 0} lecciones
                                    </span>
                                </div>
                                <div className="section-actions" onClick={e => e.stopPropagation()}>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleAiGenerate(section.id)}
                                        disabled={generating}
                                    >
                                        <Sparkles size={16} />
                                        {generating ? 'Generando...' : 'IA'}
                                    </button>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleOpenLessonModal(section.id)}
                                    >
                                        <Plus size={16} /> Lección
                                    </button>
                                    <button
                                        className="btn btn-outline btn-icon btn-sm"
                                        onClick={() => handleOpenSectionModal(section)}
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        className="btn btn-outline btn-icon btn-sm danger"
                                        onClick={() => handleDeleteSection(section)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    {expandedSections[section.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {expandedSections[section.id] && (
                                <div className="lessons-list">
                                    {section.lessons?.length === 0 ? (
                                        <p className="empty-message">No hay lecciones en esta sección</p>
                                    ) : (
                                        section.lessons?.sort((a, b) => a.order_index - b.order_index).map((lesson, lIndex) => (
                                            <div key={lesson.id} className="lesson-item">
                                                <div className="lesson-icon">
                                                    {getContentIcon(lesson.content_type)}
                                                </div>
                                                <div className="lesson-info">
                                                    <span className="lesson-number">{lIndex + 1}.</span>
                                                    <span className="lesson-name">{lesson.name}</span>
                                                    {lesson.duration_minutes > 0 && (
                                                        <span className="lesson-duration">{lesson.duration_minutes} min</span>
                                                    )}
                                                </div>
                                                <div className="lesson-actions">
                                                    <button
                                                        className="btn btn-outline btn-icon btn-sm"
                                                        onClick={() => handleOpenLessonModal(section.id, lesson)}
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-outline btn-icon btn-sm danger"
                                                        onClick={() => handleDeleteLesson(lesson)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal para Sección */}
            {showSectionModal && (
                <div className="modal-overlay" onClick={() => setShowSectionModal(false)}>
                    <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowSectionModal(false)}>
                            <X size={24} />
                        </button>
                        <h2>{editingSection ? 'Editar Sección' : 'Nueva Sección'}</h2>
                        <form onSubmit={handleSaveSection}>
                            <div className="form-group">
                                <label>Nombre de la Sección *</label>
                                <input
                                    type="text"
                                    value={sectionForm.name}
                                    onChange={e => setSectionForm({ ...sectionForm, name: e.target.value })}
                                    placeholder="Ej: Módulo 1 - Introducción"
                                    required
                                    disabled={saving}
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    value={sectionForm.description}
                                    onChange={e => setSectionForm({ ...sectionForm, description: e.target.value })}
                                    placeholder="Descripción opcional..."
                                    rows={3}
                                    disabled={saving}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowSectionModal(false)} disabled={saving}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? (
                                        <><Loader size={16} className="spin" /> Guardando...</>
                                    ) : (
                                        <><Save size={16} /> {editingSection ? 'Guardar' : 'Crear Sección'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Lección */}
            {showLessonModal && (
                <div className="modal-overlay" onClick={() => setShowLessonModal(false)}>
                    <div className="modal-content glass-card modal-lg" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowLessonModal(false)}>
                            <X size={24} />
                        </button>
                        <h2>{editingLesson ? 'Editar Lección' : 'Nueva Lección'}</h2>
                        <form onSubmit={handleSaveLesson} className="form-grid">
                            <div className="form-group full-width">
                                <label>Nombre de la Lección *</label>
                                <input
                                    type="text"
                                    value={lessonForm.name}
                                    onChange={e => setLessonForm({ ...lessonForm, name: e.target.value })}
                                    placeholder="Ej: Introducción a los números"
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group">
                                <label>Tipo de Contenido</label>
                                <select
                                    value={lessonForm.content_type}
                                    onChange={(e) => setLessonForm({ ...lessonForm, content_type: e.target.value })}
                                    disabled={saving}
                                >
                                    <option value="video">🎥 Video (MP4, YouTube, Vimeo)</option>
                                    <option value="pdf">📄 Documento PDF</option>
                                    <option value="word">📝 Documento Word (DOC, DOCX)</option>
                                    <option value="text">📖 Texto/HTML</option>
                                    <option value="quiz">❓ Examen Quiz</option>
                                </select>
                            </div>

                            {lessonForm.content_type === 'video' && (
                                <div className="form-group">
                                    <label>Duración (minutos)</label>
                                    <input
                                        type="number"
                                        value={lessonForm.duration_minutes}
                                        onChange={e => setLessonForm({ ...lessonForm, duration_minutes: e.target.value })}
                                        placeholder="30"
                                        min="0"
                                        disabled={saving}
                                    />
                                </div>
                            )}

                            {lessonForm.content_type === 'video' && (
                                <div className="form-group full-width">
                                    <label>Video</label>
                                    <div className="file-upload-group">
                                        <input
                                            type="text"
                                            value={lessonForm.video_url}
                                            onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value, videoFile: null })}
                                            placeholder="URL del video (YouTube, Vimeo, etc.) o sube un archivo"
                                            disabled={saving}
                                        />
                                        <label className="btn btn-outline file-upload-btn">
                                            <Upload size={16} />
                                            <span>Subir</span>
                                            <input
                                                type="file"
                                                ref={videoFileRef}
                                                accept="video/*"
                                                onChange={(e) => handleFileChange(e, 'video')}
                                                style={{ display: 'none' }}
                                                disabled={saving}
                                            />
                                        </label>
                                    </div>
                                    {lessonForm.videoFile && (
                                        <p className="file-selected">
                                            <CheckCircle size={14} /> Archivo seleccionado: {lessonForm.videoFile.name}
                                        </p>
                                    )}
                                    {(lessonForm.video_url || lessonForm.videoFile) && (
                                        <div className="file-preview">
                                            <span className="preview-label"><CheckCircle size={14} /> Video configurado correctamente</span>
                                            <p className="file-path" style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                                                <span style={{fontSize: '0.7rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: lessonForm.videoFile ? 'var(--success-bg)' : 'var(--info-bg)', color: lessonForm.videoFile ? 'var(--success-text)' : 'var(--info-text)'}}>
                                                    {lessonForm.videoFile ? '📁 Local' : '🌐 URL'}
                                                </span>
                                                <span>{lessonForm.videoFile ? lessonForm.videoFile.name : lessonForm.video_url}</span>
                                            </p>
                                        </div>
                                    )}
                                    {(filePreviewUrls.video || lessonForm.video_url) && (
                                        <div className="video-embed-preview" style={{marginTop: '0.5rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface)'}}>
                                            {filePreviewUrls.video ? (
                                                <video controls style={{width: '100%', maxHeight: '200px'}}>
                                                    <source src={filePreviewUrls.video} type={lessonForm.videoFile?.type || 'video/mp4'} />
                                                    Tu navegador no soporta el elemento de video.
                                                </video>
                                            ) : (
                                                <iframe 
                                                    src={getEmbedUrl(lessonForm.video_url)}
                                                    style={{width: '100%', height: '200px', border: 'none'}}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    title="Vista previa del video"
                                                />
                                            )}
                                        </div>
                                    )}
                                    {uploadProgress.videos > 0 && uploadProgress.videos < 100 && (
                                        <div className="upload-progress">
                                            <div className="progress-bar" style={{ width: `${uploadProgress.videos}%` }} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {lessonForm.content_type === 'pdf' && (
                                <div className="form-group full-width">
                                    <label>Documento PDF</label>
                                    <div className="file-upload-group">
                                        <input
                                            type="text"
                                            value={lessonForm.pdf_url}
                                            onChange={e => setLessonForm({ ...lessonForm, pdf_url: e.target.value, pdfFile: null })}
                                            placeholder="URL del PDF o sube un archivo"
                                            disabled={saving}
                                        />
                                        <label className="btn btn-outline file-upload-btn">
                                            <Upload size={16} />
                                            <span>Subir PDF</span>
                                            <input
                                                type="file"
                                                ref={pdfFileRef}
                                                accept=".pdf,application/pdf"
                                                onChange={(e) => handleFileChange(e, 'pdf')}
                                                style={{ display: 'none' }}
                                                disabled={saving}
                                            />
                                        </label>
                                    </div>
                                    {lessonForm.pdfFile && (
                                        <p className="file-selected">
                                            <CheckCircle size={14} /> Archivo seleccionado: {lessonForm.pdfFile.name}
                                        </p>
                                    )}
                                    {(lessonForm.pdf_url || lessonForm.pdfFile) && (
                                        <div className="file-preview">
                                            <a 
                                                href={filePreviewUrls.pdf || lessonForm.pdf_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="btn btn-outline btn-sm"
                                                style={{marginRight: '0.5rem'}}
                                            >
                                                <FileText size={14} /> Ver PDF
                                            </a>
                                            <p className="file-path" style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                                                <span style={{fontSize: '0.7rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: lessonForm.pdfFile ? 'var(--success-bg)' : 'var(--info-bg)', color: lessonForm.pdfFile ? 'var(--success-text)' : 'var(--info-text)'}}>
                                                    {lessonForm.pdfFile ? '📁 Local' : '🌐 URL'}
                                                </span>
                                                <span>{lessonForm.pdfFile ? lessonForm.pdfFile.name : lessonForm.pdf_url}</span>
                                            </p>
                                        </div>
                                    )}
                                    {(filePreviewUrls.pdf || lessonForm.pdf_url) && (
                                        <div className="pdf-embed-preview" style={{marginTop: '0.5rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface)'}}>
                                            <iframe 
                                                src={filePreviewUrls.pdf || `${lessonForm.pdf_url}#toolbar=0&navpanes=0&scrollbar=0`}
                                                style={{width: '100%', height: '250px', border: 'none'}} 
                                                title="Vista previa del PDF"
                                            />
                                        </div>
                                    )}
                                    {uploadProgress.documents > 0 && uploadProgress.documents < 100 && (
                                        <div className="upload-progress">
                                            <div className="progress-bar" style={{ width: `${uploadProgress.documents}%` }} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {lessonForm.content_type === 'word' && (
                                <div className="form-group full-width">
                                    <label>Documento Word (DOC/DOCX)</label>
                                    <div className="file-upload-group">
                                        <input
                                            type="text"
                                            value={lessonForm.word_url}
                                            onChange={e => setLessonForm({ ...lessonForm, word_url: e.target.value, wordFile: null })}
                                            placeholder="URL del documento Word o sube un archivo"
                                            disabled={saving}
                                        />
                                        <label className="btn btn-outline file-upload-btn">
                                            <Upload size={16} />
                                            <span>Subir Word</span>
                                            <input
                                                type="file"
                                                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                onChange={(e) => handleFileChange(e, 'word')}
                                                style={{ display: 'none' }}
                                                disabled={saving}
                                            />
                                        </label>
                                    </div>
                                    {(lessonForm.word_url || lessonForm.wordFile) && (
                                        <div className="file-preview">
                                            <p className="file-path" style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                                                <span style={{fontSize: '0.7rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: lessonForm.wordFile ? 'var(--success-bg)' : 'var(--info-bg)', color: lessonForm.wordFile ? 'var(--success-text)' : 'var(--info-text)'}}>
                                                    {lessonForm.wordFile ? '📁 Local' : '🌐 URL'}
                                                </span>
                                                <span>{lessonForm.wordFile ? lessonForm.wordFile.name : lessonForm.word_url}</span>
                                            </p>
                                        </div>
                                    )}
                                    {uploadProgress.documents > 0 && uploadProgress.documents < 100 && (
                                        <div className="upload-progress">
                                            <div className="progress-bar" style={{ width: `${uploadProgress.documents}%` }} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {lessonForm.content_type === 'text' && (
                                <div className="form-group full-width">
                                    <label>Contenido HTML</label>
                                    <textarea
                                        value={lessonForm.content_html}
                                        onChange={e => setLessonForm({ ...lessonForm, content_html: e.target.value })}
                                        placeholder="Escribe el contenido de la lección aquí... (soporta HTML)"
                                        rows={8}
                                        disabled={saving}
                                    />
                                    {lessonForm.content_html && (
                                        <div className="html-preview">
                                            <details>
                                                <summary>Vista previa del contenido</summary>
                                                <div className="preview-content" dangerouslySetInnerHTML={{ __html: lessonForm.content_html }} />
                                            </details>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="form-group full-width">
                                <label>Descripción</label>
                                <textarea
                                    value={lessonForm.description}
                                    onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                                    placeholder="Descripción de la lección..."
                                    rows={3}
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-actions full-width">
                                <button type="button" className="btn btn-outline" onClick={() => setShowLessonModal(false)} disabled={saving}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? (
                                        <><Loader size={16} className="spin" /> Guardando...</>
                                    ) : (
                                        <><Save size={16} /> {editingLesson ? 'Guardar' : 'Crear Lección'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </>
    );
};

export default CurriculumBuilder;
