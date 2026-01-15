import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, UserPlus, X, Edit2, Trash2, Mail, Lock } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';

const TeacherManagement = () => {
    const { showNotification, NotificationComponent } = useNotification();
    const [teachers, setTeachers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [sendingInvite, setSendingInvite] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        specialization: '',
        temporary_password: ''
    });

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'author')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching teachers:', error);
        } else {
            setTeachers(data || []);
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({
            full_name: '',
            email: '',
            phone: '',
            specialization: '',
            temporary_password: ''
        });
        setEditingUser(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleOpenEditModal = (user) => {
        setFormData({
            full_name: user.full_name || '',
            email: user.email || '',
            phone: user.phone || '',
            specialization: user.specialization || '',
            temporary_password: ''
        });
        setEditingUser(user);
        setShowAddModal(true);
    };

    const generatePassword = () => {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setFormData({ ...formData, temporary_password: password });
    };

    const sendInvitationEmail = async (email, password, name) => {
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.VITE_RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: 'noreply@lapregilda.com',
                    to: email,
                    subject: 'Bienvenido a La Pre Gilda - Credenciales de Acceso',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
                            <div style="background-color: #0f172a; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                                <h1 style="margin: 0;">🎓 La Pre Gilda</h1>
                                <p style="margin: 10px 0 0 0; color: #94a3b8;">Bienvenido al equipo de profesores</p>
                            </div>
                            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
                                <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${name}</strong>,</p>
                                <p style="font-size: 16px; line-height: 1.6;">Has sido registrado como profesor en nuestra plataforma. Aquí están tus credenciales de acceso:</p>
                                <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 5px 0;"><strong>URL:</strong> <a href="https://lapregilda.com/login" style="color: #3b82f6;">https://lapregilda.com/login</a></p>
                                    <p style="margin: 5px 0;"><strong>Correo:</strong> ${email}</p>
                                    <p style="margin: 5px 0;"><strong>Contraseña:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${password}</code></p>
                                </div>
                                <p style="font-size: 16px; line-height: 1.6;">Por seguridad, te recomendamos cambiar tu contraseña al primer inicio de sesión.</p>
                                <p style="font-size: 16px; line-height: 1.6;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
                                <p style="margin-top: 30px; font-size: 16px;">Saludos,<br>El equipo de La Pre Gilda</p>
                            </div>
                        </div>
                    `
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.full_name.trim() || !formData.email.trim()) {
            showNotification('El nombre y correo son requeridos', 'error');
            return;
        }

        const userData = {
            full_name: formData.full_name,
            email: formData.email.toLowerCase(),
            phone: formData.phone || null,
            specialization: formData.specialization || null,
            role: 'author',
            password: formData.temporary_password || null,
            active: true
        };

        try {
            if (editingUser) {
                const { error } = await supabase
                    .from('profiles')
                    .update(userData)
                    .eq('id', editingUser.id);

                if (error) throw error;
                showNotification('Profesor actualizado exitosamente', 'success');
            } else {
                if (!formData.temporary_password) {
                    showNotification('Debes generar o ingresar una contraseña temporal', 'error');
                    return;
                }

                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([userData]);

                if (profileError) throw profileError;

                const emailSent = await sendInvitationEmail(
                    formData.email,
                    formData.temporary_password,
                    formData.full_name
                );

                if (emailSent) {
                    showNotification('Profesor creado y correo enviado exitosamente', 'success');
                } else {
                    showNotification('Profesor creado. No se pudo enviar el correo (configura RESEND_API_KEY)', 'warning');
                }
            }

            setShowAddModal(false);
            resetForm();
            fetchTeachers();
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
        }
    };

    const handleDelete = async (user) => {
        if (!confirm(`¿Estás seguro de eliminar a ${user.full_name}? Esta acción no se puede deshacer.`)) {
            return;
        }

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);

        if (error) {
            showNotification(`Error al eliminar: ${error.message}`, 'error');
        } else {
            showNotification('Profesor eliminado exitosamente', 'success');
            fetchTeachers();
        }
    };

    const filteredTeachers = teachers.filter(t => {
        return (
            t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            t.email?.toLowerCase().includes(search.toLowerCase()) ||
            t.specialization?.toLowerCase().includes(search.toLowerCase())
        );
    });

    return (
        <>
            <NotificationComponent />
            <div className="user-mgmt animate-fade-in">
            <header className="page-header flex-between">
                <div>
                    <h1>Gestión de Profesores</h1>
                    <p>Administración del cuerpo docente y acceso al Curriculum Builder</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenAddModal}>
                    <UserPlus size={20} />
                    Nuevo Profesor
                </button>
            </header>

            <div className="filters-bar glass-card">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo o especialidad..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-mini glass-card">
                    <span className="stat-number">{teachers.length}</span>
                    <span className="stat-label">Total Profesores</span>
                </div>
                <div className="stat-mini glass-card">
                    <span className="stat-number success">{teachers.filter(t => t.active !== false).length}</span>
                    <span className="stat-label">Activos</span>
                </div>
            </div>

            <div className="users-table-container glass-card">
                {loading ? (
                    <div className="loading-state">Cargando profesores...</div>
                ) : filteredTeachers.length === 0 ? (
                    <div className="empty-state">
                        <UserPlus size={48} />
                        <p>No se encontraron profesores</p>
                        <button className="btn btn-primary" onClick={handleOpenAddModal}>
                            Agregar primer profesor
                        </button>
                    </div>
                ) : (
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Profesor</th>
                                <th>Especialidad</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.map(teacher => (
                                <tr key={teacher.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar">{teacher.full_name?.charAt(0)}</div>
                                            <div>
                                                <div className="user-name">{teacher.full_name}</div>
                                                <div className="user-email">{teacher.email || teacher.phone || 'Sin contacto'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{teacher.specialization || 'Sin especialidad'}</td>
                                    <td>
                                        <span className={`status-pill ${teacher.active !== false ? 'paid' : 'unpaid'}`}>
                                            {teacher.active !== false ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                        <button
                                            className="btn btn-outline btn-icon"
                                            onClick={() => handleOpenEditModal(teacher)}
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="btn btn-outline btn-icon"
                                            onClick={async () => {
                                                const { error } = await supabase
                                                    .from('profiles')
                                                    .update({ active: !teacher.active })
                                                    .eq('id', teacher.id);
                                                if (!error) {
                                                    fetchTeachers();
                                                }
                                            }}
                                            title={teacher.active ? 'Desactivar' : 'Activar'}
                                        >
                                            {teacher.active ? '🔓' : '🔒'}
                                        </button>
                                        <button
                                            className="btn btn-outline btn-icon danger"
                                            onClick={() => handleDelete(teacher)}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content glass-card modal-lg" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowAddModal(false)}>
                            <X size={24} />
                        </button>
                        <h2>{editingUser ? 'Editar Profesor' : 'Nuevo Profesor'}</h2>

                        <form onSubmit={handleSubmit} className="form-grid">
                            <div className="form-group full-width">
                                <label>Nombre Completo *</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="Nombres y apellidos"
                                    required
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Correo Electrónico *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="profesor@email.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="987654321"
                                />
                            </div>

                            <div className="form-group">
                                <label>Especialidad</label>
                                <input
                                    type="text"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    placeholder="Ej: Matemáticas, Física, Química"
                                />
                            </div>

                            {!editingUser && (
                                <div className="form-group full-width">
                                    <label>Contraseña Temporal *</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            value={formData.temporary_password}
                                            onChange={(e) => setFormData({ ...formData, temporary_password: e.target.value })}
                                            placeholder="Contraseña de acceso inicial"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            onClick={generatePassword}
                                            title="Generar contraseña segura"
                                        >
                                            <Lock size={18} />
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        Esta contraseña será enviada al correo del profesor
                                    </p>
                                </div>
                            )}

                            <div className="form-actions full-width">
                                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingUser ? 'Guardar Cambios' : 'Crear Profesor'}
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

export default TeacherManagement;
