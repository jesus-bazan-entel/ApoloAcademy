import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Image as ImageIcon, Eye, EyeOff, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification';

const CourseManagement = () => {
    const { showNotification, NotificationComponent } = useNotification();
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image_url: '',
        status: 'draft',
        price: '',
        teacher_id: ''
    });
    const navigate = useNavigate();
    const userRole = sessionStorage.getItem('userRole') || 'admin';

    useEffect(() => {
        fetchCourses();
        if (userRole === 'admin') {
            fetchTeachers();
        }
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('courses')
            .select('*, profiles(full_name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching courses:', error);
        } else {
            const coursesWithTeacherNames = (data || []).map(course => ({
                ...course,
                teacher_name: course.profiles?.full_name || 'Sin asignar'
            }));
            setCourses(coursesWithTeacherNames);
        }
        setLoading(false);
    };

    const fetchTeachers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('role', 'author')
            .eq('active', true)
            .order('full_name');

        if (error) {
            console.error('Error fetching teachers:', error);
        } else {
            setTeachers(data || []);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            image_url: '',
            status: 'draft',
            price: '',
            teacher_id: ''
        });
        setEditingCourse(null);
    };

    const handleOpenModal = (course = null) => {
        if (course) {
            setFormData({
                name: course.name || '',
                description: course.description || '',
                image_url: course.image_url || '',
                status: course.status || 'draft',
                price: course.price?.toString() || '',
                teacher_id: course.teacher_id || ''
            });
            setEditingCourse(course);
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            showNotification('El nombre del curso es requerido', 'error');
            return;
        }

        const courseData = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            image_url: formData.image_url.trim(),
            status: formData.status,
            price: formData.price ? parseFloat(formData.price) : 0,
            teacher_id: formData.teacher_id || null
        };

        if (editingCourse) {
            const { error } = await supabase
                .from('courses')
                .update(courseData)
                .eq('id', editingCourse.id);

            if (error) throw error;
            showNotification('Curso actualizado exitosamente', 'success');
        } else {
            const { error } = await supabase
                .from('courses')
                .insert([courseData]);

            if (error) throw error;
            showNotification('Curso creado exitosamente', 'success');
        }

        setShowModal(false);
        resetForm();
        fetchCourses();
    };

    const handleDelete = async (course) => {
        if (!confirm(`¿Estás seguro de eliminar el curso "${course.name}"? Esta acción eliminará también todas las secciones y lecciones asociadas.`)) {
            return;
        }

        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', course.id);

        if (error) {
            alert('Error al eliminar el curso: ' + error.message);
        } else {
            fetchCourses();
        }
    };

    const handleToggleStatus = async (course) => {
        const newStatus = course.status === 'live' ? 'draft' : 'live';
        const { error } = await supabase
            .from('courses')
            .update({ status: newStatus })
            .eq('id', course.id);

        if (error) {
            alert('Error al cambiar el estado: ' + error.message);
        } else {
            fetchCourses();
        }
    };

    return (
        <>
            <NotificationComponent />
            <div className="course-mgmt animate-fade-in">
            <header className="page-header flex-between">
                <div>
                    <h1>Gestión de Cursos</h1>
                    <p>Crea y administra el contenido educativo</p>
                </div>
                {userRole === 'admin' && (
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        Nuevo Curso
                    </button>
                )}
            </header>

            <div className="stats-row">
                <div className="stat-mini glass-card">
                    <span className="stat-number">{courses.length}</span>
                    <span className="stat-label">Total Cursos</span>
                </div>
                <div className="stat-mini glass-card">
                    <span className="stat-number success">{courses.filter(c => c.status === 'live').length}</span>
                    <span className="stat-label">Publicados</span>
                </div>
                <div className="stat-mini glass-card">
                    <span className="stat-number warning">{courses.filter(c => c.status === 'draft').length}</span>
                    <span className="stat-label">Borradores</span>
                </div>
            </div>

            <div className="courses-grid">
                {loading ? (
                    <div className="loading-state">Cargando cursos...</div>
                ) : courses.length === 0 ? (
                    <div className="empty-state glass-card">
                        <ImageIcon size={48} />
                        <p>No hay cursos creados</p>
                        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                            Crear primer curso
                        </button>
                    </div>
                ) : (
                    courses.map(course => (
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
                                <p>{course.description || 'Sin descripción'}</p>
                                <div className="course-meta-row">
                                    <span>{course.lessons_count || 0} lecciones</span>
                                    {course.teacher_name && <span style={{ marginLeft: '0.5rem' }}>👨‍🏫 {course.teacher_name}</span>}
                                    {course.price > 0 && <span className="price">S/ {course.price}</span>}
                                </div>
                                <div className="course-actions">
                                    <button
                                        className="btn btn-outline btn-icon"
                                        onClick={() => navigate(`/admin/courses/${course.id}`)}
                                        title="Editar contenido"
                                    >
                                        <Edit2 size={16} />
                                        Contenido
                                    </button>
                                    {userRole === 'admin' && (
                                        <>
                                            <button
                                                className="btn btn-outline btn-icon"
                                                onClick={() => handleOpenModal(course)}
                                                title="Editar detalles"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className={`btn btn-outline btn-icon ${course.status === 'live' ? 'success' : ''}`}
                                                onClick={() => handleToggleStatus(course)}
                                                title={course.status === 'live' ? 'Despublicar' : 'Publicar'}
                                            >
                                                {course.status === 'live' ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                            <button
                                                className="btn btn-outline btn-icon danger"
                                                onClick={() => handleDelete(course)}
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal para crear/editar curso */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass-card modal-lg" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowModal(false)}>
                            <X size={24} />
                        </button>
                        <h2>{editingCourse ? 'Editar Curso' : 'Nuevo Curso'}</h2>

                        <form onSubmit={handleSubmit} className="form-grid">
                            <div className="form-group full-width">
                                <label>Nombre del Curso *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Matemática Básica"
                                    required
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe el contenido del curso..."
                                    rows={3}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>URL de Imagen</label>
                                <input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                />
                            </div>

                            <div className="form-group">
                                <label>Precio (S/)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="form-group">
                                <label>Estado</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="draft">Borrador</option>
                                    <option value="live">Publicado</option>
                                </select>
                            </div>

                            {userRole === 'admin' && (
                                <div className="form-group">
                                    <label>Profesor Asignado</label>
                                    <select
                                        value={formData.teacher_id}
                                        onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                                    >
                                        <option value="">Sin asignar</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-actions full-width">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCourse ? 'Guardar Cambios' : 'Crear Curso'}
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

export default CourseManagement;
