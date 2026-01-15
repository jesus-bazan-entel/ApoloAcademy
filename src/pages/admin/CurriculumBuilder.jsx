import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { generateLessonContent, generateQuizQuestions } from '../../lib/gemini';
import { Plus, ChevronDown, ChevronUp, Video, FileText, HelpCircle, Sparkles, Save, ArrowLeft } from 'lucide-react';

const CurriculumBuilder = () => {
    const { id: courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchCourseAndSections();
    }, [courseId]);

    const fetchCourseAndSections = async () => {
        const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
        const { data: sectionsData } = await supabase.from('sections').select('*, lessons(*)').eq('course_id', courseId).order('order_index');

        setCourse(courseData);
        setSections(sectionsData || []);
        setLoading(false);
    };

    const handleAddSection = async () => {
        const name = prompt('Nombre de la sección:');
        if (!name) return;
        const { data } = await supabase.from('sections').insert([{ course_id: courseId, name, order_index: sections.length }]).select().single();
        if (data) setSections([...sections, { ...data, lessons: [] }]);
    };

    const handleAiGenerate = async (sectionId, topic) => {
        setGenerating(true);
        const content = await generateLessonContent(topic, 'Academia Pre-universitaria');
        const quiz = await generateQuizQuestions(topic, 'Academia Pre-universitaria');

        // Save generated content to database
        const { data: lesson } = await supabase.from('lessons').insert([{
            section_id: sectionId,
            name: `IA: ${topic}`,
            content_type: 'pdf',
            pdf_url: 'ai-generated', // Placeholder for generated HTML/PDF
            order_index: 0
        }]).select().single();

        if (lesson && quiz) {
            await supabase.from('quizzes').insert([{ lesson_id: lesson.id, questions: quiz }]);
        }

        fetchCourseAndSections();
        setGenerating(false);
    };

    if (loading) return <p>Cargando curriculum...</p>;

    return (
        <div className="curriculum-builder animate-fade-in">
            <header className="page-header">
                <button onClick={() => window.history.back()} className="btn btn-outline mb-4">
                    <ArrowLeft size={16} /> Volver
                </button>
                <h1>{course?.name}</h1>
                <p>Estructura el contenido de tu curso</p>
            </header>

            <div className="sections-list">
                {sections.map(section => (
                    <div key={section.id} className="section-container glass-card">
                        <div className="section-header">
                            <h3>{section.name}</h3>
                            <div className="section-actions">
                                <button className="btn btn-outline btn-sm" onClick={() => {
                                    const topic = prompt('Tema para generar con IA:');
                                    if (topic) handleAiGenerate(section.id, topic);
                                }}>
                                    <Sparkles size={16} />
                                    {generating ? 'Generando...' : 'IA Generate'}
                                </button>
                                <button className="btn btn-primary btn-sm">
                                    <Plus size={16} /> Lección
                                </button>
                            </div>
                        </div>

                        <div className="lessons-list">
                            {section.lessons?.map(lesson => (
                                <div key={lesson.id} className="lesson-item">
                                    <div className="lesson-icon">
                                        {lesson.content_type === 'video' ? <Video size={18} /> :
                                            lesson.content_type === 'quiz' ? <HelpCircle size={18} /> :
                                                <FileText size={18} />}
                                    </div>
                                    <span>{lesson.name}</span>
                                    <div className="lesson-actions">
                                        <button className="btn btn-outline btn-icon"><Save size={14} /></button>
                                    </div>
                                </div>
                            ))}
                            {(!section.lessons || section.lessons.length === 0) && (
                                <p className="empty-message">No hay lecciones en esta sección</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button className="btn btn-outline w-full mt-4" onClick={handleAddSection}>
                <Plus size={20} /> Añadir Sección
            </button>
        </div>
    );
};

export default CurriculumBuilder;
