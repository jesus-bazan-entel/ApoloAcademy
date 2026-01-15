import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        // In a real app, this would join with enrollments table
        const { data } = await supabase.from('courses').select('*').eq('status', 'live');
        if (data) setCourses(data);
    };

    return (
        <div className="my-courses animate-fade-in">
            <header className="page-header">
                <h1>Mis Cursos</h1>
                <p>Continua donde lo dejaste</p>
            </header>

            <div className="courses-list-vertical">
                {courses.map(course => (
                    <div key={course.id} className="course-item-horizontal glass-card" onClick={() => navigate(`/student/lesson/${course.id}`)}>
                        <div className="course-thumb-small">
                            <img src={course.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop'} alt={course.name} />
                        </div>
                        <div className="course-info-small">
                            <h3>{course.name}</h3>
                            <p>12 / 24 lecciones completadas</p>
                            <div className="progress-mini">
                                <div className="progress-fill" style={{ width: '50%' }}></div>
                            </div>
                        </div>
                        <ChevronRight className="text-muted" />
                    </div>
                ))}
                {courses.length === 0 && (
                    <div className="empty-state glass-card">
                        <BookOpen size={48} />
                        <p>Aún no estás matriculado en ningún curso.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourses;
