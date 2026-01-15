import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Play, FileText, CheckCircle, Send } from 'lucide-react';

const LessonPlayer = () => {
    const { id: lessonId } = useParams();
    const [lesson, setLesson] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    useEffect(() => {
        fetchLesson();
    }, [lessonId]);

    const fetchLesson = async () => {
        const { data: lessonData } = await supabase.from('lessons').select('*, sections(course_id)').eq('id', lessonId).single();
        const { data: quizData } = await supabase.from('quizzes').select('*').eq('lesson_id', lessonId).single();

        setLesson(lessonData);
        setQuiz(quizData);
    };

    return (
        <div className="lesson-player animate-fade-in">
            <div className="video-viewport glass-card">
                {lesson?.content_type === 'video' ? (
                    <div className="mock-video">
                        <Play size={64} fill="white" />
                    </div>
                ) : (
                    <div className="pdf-viewer">
                        <FileText size={48} />
                        <p>Material de lectura disponible</p>
                        <button className="btn btn-primary">Descargar PDF</button>
                    </div>
                )}
            </div>

            <div className="lesson-content">
                <h1>{lesson?.name || 'Cargando lección...'}</h1>
                <p className="lesson-desc">En esta lección cubriremos los fundamentos de este tema para asegurar tu ingreso.</p>

                {quiz && (
                    <div className="quiz-section glass-card">
                        <h3>Cuestionario de Repaso</h3>
                        {quiz.questions.map((q, idx) => (
                            <div key={idx} className="quiz-question">
                                <p>{q.question}</p>
                                <div className="options-grid">
                                    {q.options.map((opt, oIdx) => (
                                        <button
                                            key={oIdx}
                                            className={`option-btn ${selectedAnswer === oIdx ? 'selected' : ''}`}
                                            onClick={() => setSelectedAnswer(oIdx)}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="student-actions">
                    <button className="btn btn-outline w-full">
                        <CheckCircle size={18} /> Marcar como completada
                    </button>
                    <div className="message-teacher">
                        <input type="text" placeholder="Duda sobre el tema? Pregunta al profesor..." />
                        <button className="btn btn-primary btn-icon"><Send size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonPlayer;
