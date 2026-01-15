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
    const [initializing, setInitializing] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();

    useEffect(() => {
        console.log("App initializing...");

        const initSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                setSession(session);
                if (session) {
                    await fetchUserRole(session.user.id);
                }
            } catch (err) {
                console.error("Auth initialization error:", err);
                setError(err.message);
            } finally {
                setInitializing(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log("Auth state changed:", _event, session?.user?.email);
            setSession(session);
            if (session) {
                await fetchUserRole(session.user.id);
            } else {
                setUserRole(null);
            }
            setInitializing(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserRole = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Profile doesn't exist yet, let's create a default one for new users
                    console.log("Creating default profile for new user...");
                    const { data: profile, error: insertError } = await supabase
                        .from('profiles')
                        .insert([{ id: userId, role: 'student', payment_status: 'unpaid' }])
                        .select()
                        .single();
                    if (profile) setUserRole(profile.role);
                } else {
                    throw error;
                }
            } else if (data) {
                setUserRole(data.role);
            }
        } catch (e) {
            console.error("Error fetching/creating user role:", e);
        }
    };

    const isAdmin = userRole === 'admin' || userRole === 'author';
    const isStudent = userRole === 'student';
    const isAuthPage = location.pathname === '/login';

    if (initializing) {
        return (
            <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', flexDirection: 'column', gap: '1rem' }}>
                <div className="animate-pulse" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Cargando Apolo Academy...</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Verificando credenciales...</div>
                {error && <div style={{ color: '#ef4444', marginTop: '1rem' }}>Error: {error}</div>}
            </div>
        );
    }

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

                    {/* Fallback for logged in users without a specific role redirect yet or wrong role for path */}
                    <Route path="*" element={
                        session ? (
                            isAdmin ? <Navigate to="/admin" /> : <Navigate to="/student" />
                        ) : (
                            <Navigate to="/login" />
                        )
                    } />
                </Routes>
            </main>

            {!isAuthPage && isStudent && <MobileNav />}
        </div>
    );
}

export default App;
