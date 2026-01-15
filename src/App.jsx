import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/shared/Sidebar';
import AdminDashboard from './pages/admin/Dashboard';
import CourseManagement from './pages/admin/CourseManagement';
import UserManagement from './pages/admin/UserManagement';
import TeacherManagement from './pages/admin/TeacherManagement';
import CurriculumBuilder from './pages/admin/CurriculumBuilder';
import CourseContent from './pages/CourseContent';
import MyCourses from './pages/MyCourses';
import Login from './pages/Login';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const location = useLocation();

    useEffect(() => {
        // Verificar si hay sesión activa
        const checkSession = () => {
            const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
            setIsLoggedIn(adminLoggedIn === 'true');
            setInitializing(false);
        };

        checkSession();

        // Escuchar cambios en sessionStorage
        const handleStorageChange = () => {
            checkSession();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const isAuthPage = location.pathname === '/login';
    const userRole = sessionStorage.getItem('userRole') || 'admin';

    if (initializing) {
        return (
            <div style={{
                display: 'flex',
                height: '100vh',
                width: '100vw',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0f172a',
                color: 'white',
                flexDirection: 'column',
                gap: '1rem',
                fontFamily: 'Inter, sans-serif'
            }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    🎓 Apolo Academy
                </div>
                <div style={{ fontSize: '1rem', color: '#94a3b8' }}>
                    Cargando...
                </div>
            </div>
        );
    }

    // Si no está logueado y no está en la página de login, redirigir
    if (!isLoggedIn && !isAuthPage) {
        return <Navigate to="/login" replace />;
    }

    // Si está logueado y está en login, redirigir según rol
    if (isLoggedIn && isAuthPage) {
        const userRole = sessionStorage.getItem('userRole');
        if (userRole === 'author') {
            return <Navigate to="/admin/courses" replace />;
        }
        return <Navigate to="/admin" replace />;
    }

    return (
        <div className="app-container">
            {!isAuthPage && isLoggedIn && <Sidebar />}

            <main className={`main-content ${!isAuthPage && isLoggedIn ? 'with-sidebar' : ''}`}>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        isLoggedIn && userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />
                    } />
                    <Route path="/admin/courses" element={
                        isLoggedIn && (userRole === 'admin' || userRole === 'author') ? <CourseManagement /> : <Navigate to="/login" replace />
                    } />
                    <Route path="/admin/courses/:id" element={
                        isLoggedIn && (userRole === 'admin' || userRole === 'author') ? <CurriculumBuilder /> : <Navigate to="/login" replace />
                    } />
                    <Route path="/admin/users" element={
                        isLoggedIn && userRole === 'admin' ? <UserManagement /> : <Navigate to="/login" replace />
                    } />
                    <Route path="/admin/teachers" element={
                        isLoggedIn && userRole === 'admin' ? <TeacherManagement /> : <Navigate to="/login" replace />
                    } />

                    {/* Student/Teacher Courses Routes */}
                    <Route path="/courses" element={
                        isLoggedIn && (userRole === 'author' || userRole === 'student') ? <MyCourses /> : <Navigate to="/login" replace />
                    } />
                    <Route path="/courses/:id" element={
                        isLoggedIn && (userRole === 'author' || userRole === 'student') ? <CourseContent /> : <Navigate to="/login" replace />
                    } />

                    {/* Default route based on role */}
                    <Route path="/" element={
                        isLoggedIn ? (
                            userRole === 'admin' ? <Navigate to="/admin" replace /> :
                            userRole === 'author' ? <Navigate to="/admin/courses" replace /> :
                            <Navigate to="/courses" replace />
                        ) : <Navigate to="/login" replace />
                    } />

                    {/* Catch-all */}
                    <Route path="*" element={
                        isLoggedIn ? (
                            userRole === 'admin' ? <Navigate to="/admin" replace /> :
                            <Navigate to="/courses" replace />
                        ) : <Navigate to="/login" replace />
                    } />
                </Routes>
            </main>
        </div>
    );
}

export default App;
