import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PlayCircle, Clock, BookOpen, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentHome = () => {
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFeatured();
    }, []);

    const fetchFeatured = async () => {
        const { data } = await supabase.from('courses').select('*').eq('status', 'live').limit(3);
        if (data) setFeaturedCourses(data);
    };

    return (
        <div className="student-home animate-fade-in">
            <section className="welcome-banner glass-card">
                <h1 className="gradient-text">¡Hola de nuevo!</h1>
                <p>Continúa preparándote para tu examen de admisión hoy.</p>
                <div className="progress-banner">
                    <div className="progress-info">
                        <span>Tu progreso actual</span>
                        <span>65%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '65%' }}></div>
                    </div>
                </div>
            </section>

            <section className="section-title">
                <h2>Cursos Recomendados</h2>
            </section>

            <div className="horizontal-scroll">
                {featuredCourses.map(course => (
                    <div key={course.id} className="student-course-card glass-card" onClick={() => navigate(`/student/lesson/${course.id}`)}>
                        <div className="course-img">
                            <img src={course.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop'} alt={course.name} />
                        </div>
                        <div className="course-details">
                            <h3>{course.name}</h3>
                            <div className="course-meta">
                                <span><Star size={14} fill="var(--warning)" stroke="var(--warning)" /> {course.rating || '4.8'}</span>
                                <span><BookOpen size={14} /> {course.lessons_count || 12} Lecc.</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <section className="section-title">
                <h2>Clases Grabadas Recientes</h2>
            </section>

            <div className="recorded-list">
                {[1, 2, 3].map(i => (
                    <div key={i} className="recorded-item glass-card">
                        <div className="recorded-thumb">
                            <PlayCircle size={32} />
                        </div>
                        <div className="recorded-info">
                            <h4>Semana {10 - i}: Repaso de Trigonometría</h4>
                            <p><Clock size={12} /> Hace {i} días • 1h 20m</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentHome;
