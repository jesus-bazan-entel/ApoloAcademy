import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen, Play, Clock, Users } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';

const MyCourses = () => {
    const { showNotification, NotificationComponent } = useNotification();
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        const studentId = sessionStorage.getItem('userId');

        if (!studentId) {
            showNotification('Debes iniciar sesión para ver tus cursos', 'error');
            navigate('/login');
            return;
        }

        setLoading(true);

        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                *,
                courses (*, profiles(full_name))
            `)
            .eq('student_id', studentId)
            .order('enrolled_at', { ascending: false });

        if (error) {
            showNotification('Error al cargar tus cursos', 'error');
        } else {
            setEnrollments(data || []);
        }

        setLoading(false);
    };

    const getProgressPercentage = (progress) => {
        return progress || 0;
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'En curso';
            case 'completed': return 'Completado';
            case 'dropped': return 'Abandonado';
            default: return 'Activo';
        }
    };

    if (loading) {
        return (
            <div className="loading-page">
                <p>Cargando tus cursos...</p>
            </div>
        );
    }

    return (
        <>
            <NotificationComponent />
            <div className="my-courses-page animate-fade-in">
                <header className="page-header">
                    <h1>Mis Cursos</h1>
                    <p>Contenido educativo disponible para ti</p>
                </header>

                {enrollments.length === 0 ? (
                    <div className="empty-state glass-card">
                        <BookOpen size={64} />
                        <h2>No estás inscrito en ningún curso</h2>
                        <p>Contacta a la administración para inscribirte en un curso.</p>
                    </div>
                ) : (
                    <div className="courses-list-vertical">
                        {enrollments.map((enrollment) => (
                            <div key={enrollment.id} className="course-item-horizontal glass-card">
                                <div className="course-thumb-small">
                                    {enrollment.courses?.image_url ? (
                                        <img src={enrollment.courses.image_url} alt={enrollment.courses.name} />
                                    ) : (
                                        <div className="thumb-placeholder">
                                            <BookOpen size={32} />
                                        </div>
                                    )}
                                </div>

                                <div className="course-info-small">
                                    <h3>{enrollment.courses?.name}</h3>
                                    <p>{enrollment.courses?.description}</p>

                                    <div className="course-meta-row">
                                        <span className="meta-info">
                                            <Clock size={12} /> {enrollment.courses?.lessons_count || 0} lecciones
                                        </span>
                                        {enrollment.courses?.profiles && (
                                            <span className="meta-info">
                                                <Users size={12} /> {enrollment.courses.profiles.full_name}
                                            </span>
                                        )}
                                        <span className={`status-badge ${enrollment.status}`}>
                                            {getStatusLabel(enrollment.status)}
                                        </span>
                                    </div>

                                    <div className="progress-wrapper">
                                        <div className="progress-bar-wrapper">
                                            <div className="progress-bar" style={{ width: `${getProgressPercentage(enrollment.progress)}%` }} />
                                        </div>
                                        <span className="progress-text">
                                            {getProgressPercentage(enrollment.progress)}% completado
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate(`/courses/${enrollment.courses?.id}`)}
                                >
                                    <Play size={16} /> Continuar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default MyCourses;
