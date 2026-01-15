import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, Settings, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Sidebar = () => {
    return (
        <aside className="sidebar glass-card">
            <div className="sidebar-header">
                <h2 className="gradient-text">Apolo Admin</h2>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/admin/courses" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <BookOpen size={20} />
                    <span>Cursos</span>
                </NavLink>
                <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <Users size={20} />
                    <span>Estudiantes</span>
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <button onClick={() => supabase.auth.signOut()} className="btn btn-outline w-full">
                    <LogOut size={18} />
                    <span>Salir</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
