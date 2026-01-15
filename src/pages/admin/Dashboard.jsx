import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, BookOpen, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeCourses: 0,
        monthlyRevenue: 0,
        growth: 0,
        loading: true
    });

    const [chartData, setChartData] = useState([
        { name: 'Lun', users: 0, sales: 0 },
        { name: 'Mar', users: 0, sales: 0 },
        { name: 'Mie', users: 0, sales: 0 },
        { name: 'Jue', users: 0, sales: 0 },
        { name: 'Vie', users: 0, sales: 0 },
        { name: 'Sab', users: 0, sales: 0 },
        { name: 'Dom', users: 0, sales: 0 },
    ]);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            // Fetch total students
            const { count: studentCount, error: studentsError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'student');

            if (studentsError) throw studentsError;

            // Fetch active courses
            const { count: coursesCount, error: coursesError } = await supabase
                .from('courses')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'live');

            if (coursesError) throw coursesError;

            // Fetch paid students for revenue calculation
            const { data: paidStudents, error: paidError } = await supabase
                .from('profiles')
                .select('payment_status')
                .eq('role', 'student')
                .eq('payment_status', 'paid');

            if (paidError) throw paidError;

            // Calculate monthly revenue (assuming $50 per student)
            const pricePerStudent = 50;
            const monthlyRevenue = (paidStudents?.length || 0) * pricePerStudent;

            // Calculate growth (simple calculation based on paid vs total ratio)
            const growthRate = studentCount > 0
                ? Math.round(((paidStudents?.length || 0) / studentCount) * 100)
                : 0;

            // Fetch recent enrollments for chart (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { data: recentStudents, error: recentError } = await supabase
                .from('profiles')
                .select('created_at, payment_status')
                .eq('role', 'student')
                .gte('created_at', sevenDaysAgo.toISOString());

            if (recentError) throw recentError;

            // Process data for charts
            const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
            const chartDataMap = {};

            // Initialize all days with 0
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dayName = dayNames[date.getDay()];
                chartDataMap[dayName] = { users: 0, sales: 0 };
            }

            // Count students by day
            recentStudents?.forEach(student => {
                const date = new Date(student.created_at);
                const dayName = dayNames[date.getDay()];
                if (chartDataMap[dayName]) {
                    chartDataMap[dayName].users += 1;
                    if (student.payment_status === 'paid') {
                        chartDataMap[dayName].sales += pricePerStudent;
                    }
                }
            });

            // Convert to array for charts
            const newChartData = Object.keys(chartDataMap).map(day => ({
                name: day,
                users: chartDataMap[day].users,
                sales: chartDataMap[day].sales
            }));

            setStats({
                totalStudents: studentCount || 0,
                activeCourses: coursesCount || 0,
                monthlyRevenue,
                growth: growthRate,
                loading: false
            });

            setChartData(newChartData);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    if (stats.loading) {
        return (
            <div className="dashboard-content animate-fade-in">
                <header className="page-header">
                    <h1>Dashboard Administrativo</h1>
                    <p>Cargando estadísticas...</p>
                </header>
            </div>
        );
    }

    return (
        <div className="dashboard-content animate-fade-in">
            <header className="page-header">
                <h1>Dashboard Administrativo</h1>
                <p>Vista general del rendimiento de LAPREGILDA</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.totalStudents.toLocaleString()}</h3>
                        <p>Total Alumnos</p>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--secondary)' }}>
                        <BookOpen size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.activeCourses}</h3>
                        <p>Cursos Activos</p>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>S/{stats.monthlyRevenue.toLocaleString()}</h3>
                        <p>Ingresos Mensuales</p>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>+{stats.growth}%</h3>
                        <p>Estudiantes Activos</p>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-container glass-card">
                    <h3>Nuevos Alumnos (Últimos 7 días)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
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
                    <h3>Ingresos (Últimos 7 días)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
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
