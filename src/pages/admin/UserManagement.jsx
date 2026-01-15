import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, CheckCircle, XCircle, QrCode, X, Edit2, Trash2, UserPlus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useNotification } from '../../hooks/useNotification';

const UserManagement = () => {
    const { showNotification, NotificationComponent } = useNotification();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedUserQR, setSelectedUserQR] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        dni: '',
        phone: '',
        student_level: '',
        student_section: '',
        payment_status: 'unpaid'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'student')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    const handleUpdatePayment = async (userId, status) => {
        const { error } = await supabase
            .from('profiles')
            .update({ payment_status: status })
            .eq('id', userId);

        if (error) {
            showNotification('Error al actualizar el estado de pago', 'error');
        } else {
            showNotification('Estado de pago actualizado', 'success');
            fetchUsers();
        }
    };

    const generateQRCode = (user) => {
        return user.qr_code_hash || `APOLO-STU-${user.id.substring(0, 8).toUpperCase()}`;
    };

    const ensureQRCode = async (user) => {
        if (!user.qr_code_hash) {
            const qrHash = `APOLO-STU-${user.id.substring(0, 8).toUpperCase()}`;
            await supabase
                .from('profiles')
                .update({ qr_code_hash: qrHash })
                .eq('id', user.id);
            fetchUsers();
        }
    };

    const resetForm = () => {
        setFormData({
            full_name: '',
            email: '',
            dni: '',
            phone: '',
            student_level: '',
            student_section: '',
            payment_status: 'unpaid'
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
            dni: user.dni || '',
            phone: user.phone || '',
            student_level: user.student_level || '',
            student_section: user.student_section || '',
            payment_status: user.payment_status || 'unpaid'
        });
        setEditingUser(user);
        setShowAddModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.full_name.trim()) {
            showNotification('El nombre es requerido', 'error');
            return;
        }

        const userData = {
            ...formData,
            role: 'student'
        };

        if (editingUser) {
            const { error } = await supabase
                .from('profiles')
                .update(userData)
                .eq('id', editingUser.id);

            if (error) {
                showNotification(`Error al actualizar: ${error.message}`, 'error');
                return;
            }
            showNotification('Alumno actualizado exitosamente', 'success');
        } else {
            const { error } = await supabase
                .from('profiles')
                .insert([userData]);

            if (error) {
                showNotification(`Error al crear: ${error.message}`, 'error');
                return;
            }
            showNotification('Alumno creado exitosamente', 'success');
        }

        setShowAddModal(false);
        resetForm();
        fetchUsers();
    };

    const handleDelete = async (user) => {
        if (!confirm(`¿Estás seguro de eliminar a ${user.full_name}?`)) {
            return;
        }

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);

        if (error) {
            showNotification(`Error al eliminar: ${error.message}`, 'error');
        } else {
            showNotification('Alumno eliminado exitosamente', 'success');
            fetchUsers();
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.dni?.includes(search);

        const matchesFilter =
            filterStatus === 'all' ||
            u.payment_status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    const getPaymentBadgeClass = (status) => {
        switch (status) {
            case 'paid': return 'paid';
            case 'partial': return 'partial';
            default: return 'unpaid';
        }
    };

    const getPaymentLabel = (status) => {
        switch (status) {
            case 'paid': return 'Pagado';
            case 'partial': return 'Parcial';
            default: return 'Pendiente';
        }
    };

    return (
        <>
            <NotificationComponent />
            <div className="user-mgmt animate-fade-in">
            <header className="page-header flex-between">
                <div>
                    <h1>Gestión de Alumnos</h1>
                    <p>Control de acceso, pagos e identificación QR</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenAddModal}>
                    <UserPlus size={20} />
                    Nuevo Alumno
                </button>
            </header>

            <div className="filters-bar glass-card">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo o DNI..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-dropdown">
                    <button
                        className="btn btn-outline"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={18} />
                        Filtros
                        {filterStatus !== 'all' && <span className="filter-badge">1</span>}
                    </button>
                    {showFilters && (
                        <div className="dropdown-menu glass-card">
                            <p className="dropdown-label">Estado de pago:</p>
                            <button
                                className={`dropdown-item ${filterStatus === 'all' ? 'active' : ''}`}
                                onClick={() => { setFilterStatus('all'); setShowFilters(false); }}
                            >
                                Todos
                            </button>
                            <button
                                className={`dropdown-item ${filterStatus === 'paid' ? 'active' : ''}`}
                                onClick={() => { setFilterStatus('paid'); setShowFilters(false); }}
                            >
                                Pagados
                            </button>
                            <button
                                className={`dropdown-item ${filterStatus === 'unpaid' ? 'active' : ''}`}
                                onClick={() => { setFilterStatus('unpaid'); setShowFilters(false); }}
                            >
                                Pendientes
                            </button>
                            <button
                                className={`dropdown-item ${filterStatus === 'partial' ? 'active' : ''}`}
                                onClick={() => { setFilterStatus('partial'); setShowFilters(false); }}
                            >
                                Pago Parcial
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-mini glass-card">
                    <span className="stat-number">{users.length}</span>
                    <span className="stat-label">Total Alumnos</span>
                </div>
                <div className="stat-mini glass-card">
                    <span className="stat-number success">{users.filter(u => u.payment_status === 'paid').length}</span>
                    <span className="stat-label">Pagados</span>
                </div>
                <div className="stat-mini glass-card">
                    <span className="stat-number danger">{users.filter(u => u.payment_status === 'unpaid').length}</span>
                    <span className="stat-label">Pendientes</span>
                </div>
            </div>

            <div className="users-table-container glass-card">
                {loading ? (
                    <div className="loading-state">Cargando alumnos...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <UserPlus size={48} />
                        <p>No se encontraron alumnos</p>
                        <button className="btn btn-primary" onClick={handleOpenAddModal}>
                            Agregar primer alumno
                        </button>
                    </div>
                ) : (
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Alumno</th>
                                <th>DNI</th>
                                <th>Estado Pago</th>
                                <th>Nivel/Sección</th>
                                <th>QR</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar">{user.full_name?.charAt(0)}</div>
                                            <div>
                                                <div className="user-name">{user.full_name}</div>
                                                <div className="user-email">{user.email || user.phone || 'Sin contacto'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.dni || 'N/A'}</td>
                                    <td>
                                        <span className={`status-pill ${getPaymentBadgeClass(user.payment_status)}`}>
                                            {getPaymentLabel(user.payment_status)}
                                        </span>
                                    </td>
                                    <td>{user.student_level || 'N/A'} - {user.student_section || 'N/A'}</td>
                                    <td>
                                        <div
                                            className="qr-mini"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                ensureQRCode(user);
                                                setSelectedUserQR(user);
                                            }}
                                            title="Click para ver QR completo"
                                        >
                                            <QRCodeSVG
                                                value={generateQRCode(user)}
                                                size={32}
                                                bgColor="transparent"
                                                fgColor="var(--text)"
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="btn btn-outline btn-icon"
                                                onClick={() => handleOpenEditModal(user)}
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn btn-outline btn-icon"
                                                onClick={() => handleUpdatePayment(user.id, user.payment_status === 'paid' ? 'unpaid' : 'paid')}
                                                title={user.payment_status === 'paid' ? 'Marcar pendiente' : 'Marcar pagado'}
                                            >
                                                {user.payment_status === 'paid' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                            </button>
                                            <button
                                                className="btn btn-outline btn-icon danger"
                                                onClick={() => handleDelete(user)}
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

            {/* Modal para agregar/editar alumno */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content glass-card modal-lg" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowAddModal(false)}>
                            <X size={24} />
                        </button>
                        <h2>{editingUser ? 'Editar Alumno' : 'Nuevo Alumno'}</h2>

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

                            <div className="form-group">
                                <label>DNI</label>
                                <input
                                    type="text"
                                    value={formData.dni}
                                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                    placeholder="12345678"
                                    maxLength={8}
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

                            <div className="form-group full-width">
                                <label>Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="alumno@email.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Nivel / Ciclo</label>
                                <select
                                    value={formData.student_level}
                                    onChange={(e) => setFormData({ ...formData, student_level: e.target.value })}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Ciclo I">Ciclo I</option>
                                    <option value="Ciclo II">Ciclo II</option>
                                    <option value="Ciclo III">Ciclo III</option>
                                    <option value="Intensivo">Intensivo</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Sección</label>
                                <select
                                    value={formData.student_section}
                                    onChange={(e) => setFormData({ ...formData, student_section: e.target.value })}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="A">Sección A</option>
                                    <option value="B">Sección B</option>
                                    <option value="C">Sección C</option>
                                    <option value="D">Sección D</option>
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <label>Estado de Pago</label>
                                <div className="radio-group">
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="payment_status"
                                            value="unpaid"
                                            checked={formData.payment_status === 'unpaid'}
                                            onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                                        />
                                        <span>Pendiente</span>
                                    </label>
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="payment_status"
                                            value="partial"
                                            checked={formData.payment_status === 'partial'}
                                            onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                                        />
                                        <span>Pago Parcial</span>
                                    </label>
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="payment_status"
                                            value="paid"
                                            checked={formData.payment_status === 'paid'}
                                            onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                                        />
                                        <span>Pagado</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-actions full-width">
                                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingUser ? 'Guardar Cambios' : 'Crear Alumno'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para ver QR completo */}
            {selectedUserQR && (
                <div className="modal-overlay" onClick={() => setSelectedUserQR(null)}>
                    <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedUserQR(null)}>
                            <X size={24} />
                        </button>
                        <h2>Código QR de Acceso</h2>
                        <p className="modal-subtitle">{selectedUserQR.full_name}</p>
                        <div className="qr-large">
                            <QRCodeSVG
                                value={generateQRCode(selectedUserQR)}
                                size={200}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <p className="qr-code-text">{generateQRCode(selectedUserQR)}</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                const svg = document.querySelector('.qr-large svg');
                                const svgData = new XMLSerializer().serializeToString(svg);
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                                const img = new Image();
                                img.onload = () => {
                                    canvas.width = img.width;
                                    canvas.height = img.height;
                                    ctx.drawImage(img, 0, 0);
                                    const a = document.createElement('a');
                                    a.download = `QR-${selectedUserQR.full_name}.png`;
                                    a.href = canvas.toDataURL('image/png');
                                    a.click();
                                };
                                img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                            }}
                        >
                            <QrCode size={16} /> Descargar QR
                        </button>
                    </div>
                </div>
            )}
            </div>
        </>
    );
};

export default UserManagement;
