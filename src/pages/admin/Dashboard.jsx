import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, BookOpen, DollarSign } from 'lucide-react';

const data = [
    { name: 'Lun', users: 40, sales: 240 },
    { name: 'Mar', users: 30, sales: 139 },
    { name: 'Mie', users: 20, sales: 980 },
    { name: 'Jue', users: 27, sales: 390 },
    { name: 'Vie', users: 18, sales: 480 },
    { name: 'Sab', users: 23, sales: 380 },
    { name: 'Dom', users: 34, sales: 430 },
];

const AdminDashboard = () => {
    return (
        <div className="dashboard-content animate-fade-in">
            <header className="page-header">
                <h1>Dashboard Administrativo</h1>
                <p>Vista general del rendimiento de LA PRE GILDA</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>1,248</h3>
                        <p>Total Alumnos</p>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--secondary)' }}>
                        <BookOpen size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>42</h3>
                        <p>Cursos Activos</p>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>$12,450</h3>
                        <p>Ingresos Mensuales</p>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>+12%</h3>
                        <p>Crecimiento</p>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-container glass-card">
                    <h3>Nuevos Alumnos (Semanal)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'var(--text)' }}
                                itemStyle={{ color: 'var(--primary)' }}
                            />
                            <Bar dataKey="users" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-container glass-card">
                    <h3>Ingresos (Semanal)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <Tooltip
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'var(--text)' }}
                            />
                            <Area type="monotone" dataKey="sales" stroke="var(--secondary)" fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
