import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../hooks/useNotification';
import '../styles/login-final.css';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'Gilda.2026';

const Login = () => {
    const { showNotification, NotificationComponent } = useNotification();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
        const userRole = sessionStorage.getItem('userRole');
        if (isLoggedIn === 'true') {
            if (userRole === 'author') {
                navigate('/admin/courses', { replace: true });
            } else {
                navigate('/admin', { replace: true });
            }
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (username === ADMIN_USER && password === ADMIN_PASS) {
                sessionStorage.setItem('adminLoggedIn', 'true');
                sessionStorage.setItem('userRole', 'admin');
                sessionStorage.setItem('userName', 'Administrador');
                window.location.href = '/admin';
            } else {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .or(`email.eq.${username},dni.eq.${username}`)
                    .single();

                if (profileError || !profileData) {
                    throw new Error('Usuario o contraseña incorrectos');
                }

                if (profileData.password !== password) {
                    throw new Error('Usuario o contraseña incorrectos');
                }

                if (profileData.role === 'author') {
                    if (!profileData.active) {
                        throw new Error('Su cuenta de profesor ha sido desactivada. Contacte al administrador.');
                    }
                    sessionStorage.setItem('adminLoggedIn', 'true');
                    sessionStorage.setItem('userRole', 'author');
                    sessionStorage.setItem('userId', profileData.id);
                    sessionStorage.setItem('userName', profileData.full_name);
                    window.location.href = '/admin/courses';
                } else {
                    throw new Error('Este usuario no tiene acceso al panel administrativo');
                }
            }
        } catch (err) {
            showNotification(err.message || 'Error al iniciar sesión', 'error');
            setLoading(false);
        }
    };

    return (
        <>
            <NotificationComponent />
            <div className="login-final-container">
                {/* Animated Gradient Background */}
                <div className="gradient-bg">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="gradient-orb orb-3"></div>
                </div>

                <div className="login-final-card">
                    {/* Logo Section */}
                    <div className="logo-section-final">
                        <img src="/logo-lapregilda.jpg" alt="LA PRE GILDA" className="logo-final" />
                        <div className="welcome-text">
                            <h2>Panel Administrativo</h2>
                            <p className="tagline-final">
                                <Shield size={14} className="sparkle" />
                                IESTP Gilda Ballivián Rosado
                                <Shield size={14} className="sparkle" />
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="form-final">
                        <div className="input-wrapper-final">
                            <label>Usuario</label>
                            <input
                                type="text"
                                placeholder="Ingresa tu usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="input-wrapper-final">
                            <div className="label-row">
                                <label>Contraseña</label>
                                <button
                                    type="button"
                                    className="show-password-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <><EyeOff size={14} /> Ocultar</> : <><Eye size={14} /> Mostrar</>}
                                </button>
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button className="submit-btn-final" type="submit" disabled={loading}>
                            {loading ? (
                                <div className="spinner"></div>
                            ) : (
                                'Iniciar sesión'
                            )}
                        </button>
                    </form>

                    <p className="admin-note">
                        Acceso para administradores y profesores
                    </p>
                </div>
            </div>
        </>
    );
};

export default Login;
