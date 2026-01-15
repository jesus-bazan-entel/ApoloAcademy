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
        console.log("🚀 App initializing...");

        const initSession = async () => {
            try {
                // Check if we have an OAuth callback with hash fragment
                const hashParams = window.location.hash;
                if (hashParams && hashParams.includes('access_token')) {
                    console.log("🔑 OAuth callback detected, processing tokens...");
                    // Supabase will automatically handle the hash fragment
                    // We just need to wait for it to process
                    const { data, error: hashError } = await supabase.auth.getSession();
                    if (hashError) {
                        console.error("❌ Error processing OAuth callback:", hashError);
                    } else if (data.session) {
                        console.log("✅ OAuth session established");
                        // Clear the hash from URL for cleaner appearance
                        window.history.replaceState(null, '', window.location.pathname);
                    }
                }

                console.log("📡 Checking Supabase connection...");
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("❌ Supabase error:", error);
                    throw error;
                }

                console.log("✅ Session check complete:", session ? "Logged in" : "Not logged in");
                setSession(session);

                if (session) {
                    console.log("👤 Fetching user role for:", session.user.email);
                    await fetchUserRole(session.user.id);
                }
            } catch (err) {
                console.error("💥 Auth initialization error:", err);
                setError(err.message);
            } finally {
                console.log("✅ Initialization complete");
                setInitializing(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log("🔄 Auth state changed:", _event, session?.user?.email);
            setSession(session);
            if (session) {
                await fetchUserRole(session.user.id);
            } else {
                setUserRole(null);
            }
            setInitializing(false);
        });

        return () => {
            console.log("🧹 Cleaning up auth subscription");
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserRole = async (userId) => {
        try {
            console.log("🔍 Fetching role for user:", userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log("⚠️ Profile not found, creating default student profile...");
                    const { data: profile, error: insertError } = await supabase
                        .from('profiles')
                        .insert([{
                            id: userId,
                            role: 'student',
                            payment_status: 'unpaid',
                            full_name: 'Nuevo Usuario'
                        }])
                        .select()
                        .single();

                    if (insertError) {
                        console.error("❌ Error creating profile:", insertError);
                    } else {
                        console.log("✅ Profile created:", profile);
                        setUserRole(profile.role);
                    }
                } else {
                    console.error("❌ Database error:", error);
                    throw error;
                }
            } else if (data) {
                console.log("✅ User role:", data.role);
                setUserRole(data.role);
            }
        } catch (e) {
            console.error("💥 Error in fetchUserRole:", e);
        }
    };

    const isAdmin = userRole === 'admin' || userRole === 'author';
    const isStudent = userRole === 'student';
    const isAuthPage = location.pathname === '/login';

    console.log("🎯 Current state:", { initializing, session: !!session, userRole, isAdmin, isStudent, isAuthPage });

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
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
                    🎓 Apolo Academy
                </div>
                <div style={{ fontSize: '1rem', color: '#94a3b8' }}>
                    Cargando sistema...
                </div>
                {error && (
                    <div style={{
                        color: '#ef4444',
                        marginTop: '1rem',
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '8px',
                        maxWidth: '400px',
                        textAlign: 'center'
                    }}>
                        <strong>Error de conexión:</strong><br />
                        {error}
                    </div>
                )}
            </div>
        );
    }

    if (!session && !isAuthPage) {
        console.log("🔒 No session, redirecting to login");
        return <Navigate to="/login" replace />;
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
                            <Route path="/" element={<Navigate to="/admin" replace />} />
                        </>
                    )}

                    {/* Student Routes */}
                    {isStudent && (
                        <>
                            <Route path="/student" element={<StudentHome />} />
                            <Route path="/student/my-courses" element={<MyCourses />} />
                            <Route path="/student/lesson/:id" element={<LessonPlayer />} />
                            <Route path="/" element={<Navigate to="/student" replace />} />
                        </>
                    )}

                    <Route path="*" element={
                        session ? (
                            isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/student" replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    } />
                </Routes>
            </main>

            {!isAuthPage && isStudent && <MobileNav />}
        </div>
    );
}

export default App;
