import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setCourses(data);
        setLoading(false);
    };

    const handleCreateCourse = async () => {
        const name = prompt('Nombre del curso:');
        if (!name) return;

        const { data, error } = await supabase
            .from('courses')
            .insert([{ name, status: 'draft' }])
            .select()
            .single();

        if (data) {
            setCourses([data, ...courses]);
            navigate(`/admin/courses/${data.id}`);
        }
    };

    return (
        <div className="course-mgmt animate-fade-in">
            <header className="page-header flex-between">
                <div>
                    <h1>Gestión de Cursos</h1>
                    <p>Crea y administra el contenido educativo</p>
                </div>
                <button className="btn btn-primary" onClick={handleCreateCourse}>
                    <Plus size={20} />
                    Nuevo Curso
                </button>
            </header>

            <div className="courses-grid">
                {loading ? (
                    <p>Cargando cursos...</p>
                ) : courses.map(course => (
                    <div key={course.id} className="course-card glass-card">
                        <div className="course-thumb">
                            {course.image_url ? (
                                <img src={course.image_url} alt={course.name} />
                            ) : (
                                <div className="thumb-placeholder">
                                    <ImageIcon size={48} />
                                </div>
                            )}
                            <span className={`status-badge ${course.status}`}>
                                {course.status === 'live' ? 'En Vivo' : 'Borrador'}
                            </span>
                        </div>
                        <div className="course-info">
                            <h3>{course.name}</h3>
                            <p>{course.lessons_count || 0} lecciones</p>
                            <div className="course-actions">
                                <button className="btn btn-outline btn-icon" onClick={() => navigate(`/admin/courses/${course.id}`)}>
                                    <Edit2 size={16} />
                                    Editar
                                </button>
                                <button className="btn btn-outline btn-icon danger">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseManagement;
