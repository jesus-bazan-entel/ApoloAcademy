import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, UserPlus, LogOut } from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const userRole = sessionStorage.getItem('userRole') || 'admin';

    const handleLogout = () => {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userName');
        navigate('/login', { replace: true });
        window.location.reload();
    };

    return (
        <aside className="sidebar glass-card">
            <div className="sidebar-header">
                <h2 className="gradient-text">LA PRE GILDA</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {userRole === 'admin' ? 'Panel Administrativo' : userRole === 'author' ? 'Panel de Profesores' : 'Mis Cursos'}
                </p>
            </div>
            <nav className="sidebar-nav">
                {userRole === 'admin' && (
                    <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>
                )}
                <NavLink to={userRole === 'admin' ? '/admin/courses' : '/courses'} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <BookOpen size={20} />
                    <span>{userRole === 'admin' || userRole === 'author' ? 'Gestionar Cursos' : 'Mis Cursos'}</span>
                </NavLink>
                {userRole === 'admin' && (
                    <>
                        <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <Users size={20} />
                            <span>Estudiantes</span>
                        </NavLink>
                        <NavLink to="/admin/teachers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <UserPlus size={20} />
                            <span>Profesores</span>
                        </NavLink>
                    </>
                )}
            </nav>
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="btn btn-outline w-full">
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
