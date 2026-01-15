import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, User, Bell } from 'lucide-react';

const MobileNav = () => {
    return (
        <nav className="mobile-nav">
            <NavLink to="/student" className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'}>
                <Home size={24} />
            </NavLink>
            <NavLink to="/student/my-courses" className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'}>
                <BookOpen size={24} />
            </NavLink>
            <NavLink to="/student/notifications" className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'}>
                <Bell size={24} />
            </NavLink>
            <NavLink to="/student/profile" className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'}>
                <User size={24} />
            </NavLink>
        </nav>
    );
};

export default MobileNav;
