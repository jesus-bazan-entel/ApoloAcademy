import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const { data } = await supabase.from('profiles').select('*');
        if (data) setUsers(data);
        setLoading(false);
    };

    const handleUpdatePayment = async (userId, status) => {
        await supabase.from('profiles').update({ payment_status: status }).eq('id', userId);
        fetchUsers();
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="user-mgmt animate-fade-in">
            <header className="page-header flex-between">
                <div>
                    <h1>Gestión de Alumnos</h1>
                    <p>Control de acceso, pagos e identificación QR</p>
                </div>
            </header>

            <div className="filters-bar glass-card">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="btn btn-outline">
                    <Filter size={18} /> Filtros
                </button>
            </div>

            <div className="users-table-container glass-card">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Alumno</th>
                            <th>Estado Pago</th>
                            <th>Nivel/Sección</th>
                            <th>Identificación QR</th>
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
                                            <div className="user-email">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-pill ${user.payment_status}`}>
                                        {user.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                                    </span>
                                </td>
                                <td>{user.student_level || 'N/A'} - {user.student_section || 'N/A'}</td>
                                <td>
                                    <div className="qr-mini">
                                        <QRCodeSVG value={user.qr_code_hash || 'no-hash'} size={32} bgColor="transparent" fgColor="var(--text)" />
                                    </div>
                                </td>
                                <td>
                                    <div className="table-actions">
                                        <button className="btn btn-outline btn-sm" onClick={() => handleUpdatePayment(user.id, user.payment_status === 'paid' ? 'unpaid' : 'paid')}>
                                            {user.payment_status === 'paid' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                            {user.payment_status === 'paid' ? 'Marcar Pendiente' : 'Marcar Pagado'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
