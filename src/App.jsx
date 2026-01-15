import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/shared/Sidebar';
import MobileNav from './components/shared/MobileNav';
import AdminDashboard from './pages/admin/Dashboard';
import CourseManagement from './pages/admin/CourseManagement';
import UserManagement from './pages/admin/UserManagement';
import CurriculumBuilder from './pages/admin/CurriculumBuilder';
import StudentHome from './pages/student/Home';
import MyCourses from './pages/student/MyCourses';
import LessonPlayer from './pages/student/LessonPlayer';
import Login from './pages/Login';
import { supabase } from './lib/supabase';

function App() {
    const [session, setSession] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchUserRole(session.user.id);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchUserRole(session.user.id);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserRole = async (userId) => {
        const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
        if (data) setUserRole(data.role);
    };

    const isAdmin = userRole === 'admin' || userRole === 'author';
    const isStudent = userRole === 'student';
    const isAuthPage = location.pathname === '/login';

    if (!session && !isAuthPage) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="app-container">
            {!isAuthPage && isAdmin && <Sidebar />}

            <main className={`main-content ${!isAuthPage && isAdmin ? 'with-sidebar' : ''} ${!isAuthPage && isStudent ? 'with-mobile-nav' : ''}`}>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Admin Routes */}
                    {isAdmin && (
                        <>
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/courses" element={<CourseManagement />} />
                            <Route path="/admin/courses/:id" element={<CurriculumBuilder />} />
                            <Route path="/admin/users" element={<UserManagement />} />
                            <Route path="/" element={<Navigate to="/admin" />} />
                        </>
                    )}

                    {/* Student Routes */}
                    {isStudent && (
                        <>
                            <Route path="/student" element={<StudentHome />} />
                            <Route path="/student/my-courses" element={<MyCourses />} />
                            <Route path="/student/lesson/:id" element={<LessonPlayer />} />
                            <Route path="/" element={<Navigate to="/student" />} />
                        </>
                    )}

                    <Route path="*" element={<Navigate to={isAdmin ? "/admin" : (isStudent ? "/student" : "/login")} />} />
                </Routes>
            </main>

            {!isAuthPage && isStudent && <MobileNav />}
        </div>
    );
}

export default App;
