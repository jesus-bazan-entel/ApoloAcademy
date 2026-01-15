import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import '../styles/login-final.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isRegistering) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: email.split('@')[0],
                        }
                    }
                });
                if (error) throw error;
                alert('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) {
                if (error.message.includes('not enabled')) {
                    setError('El inicio de sesión con Google no está habilitado. Por favor, usa tu correo y contraseña.');
                } else {
                    setError(error.message);
                }
            }
        } catch (err) {
            setError('Error al conectar con Google. Intenta con correo y contraseña.');
        }
    };

    return (
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
                    <img src="/logo-lapregilda.jpg" alt="LAPREGILDA" className="logo-final" />
                    <div className="welcome-text">
                        <h2>¡Bienvenido!</h2>
                        <p className="tagline-final">
                            <Sparkles size={14} className="sparkle" />
                            Tu camino al IESTP Gilda Ballivián Rosado
                            <Sparkles size={14} className="sparkle" />
                        </p>
                    </div>
                </div>

                {/* Google Login */}
                <button className="google-btn-final" onClick={handleGoogleLogin} type="button">
                    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                        <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853" />
                        <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                        <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
                    </svg>
                    Continuar con Google
                </button>

                <div className="divider-final">
                    <span>o</span>
                </div>

                {/* Form */}
                <form onSubmit={handleAuth} className="form-final">
                    <div className="input-wrapper-final">
                        <label>Correo institucional</label>
                        <input
                            type="email"
                            placeholder="usuario@gilda.edu.pe"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            required
                        />
                    </div>

                    {error && <div className="error-final">{error}</div>}

                    <div className="form-footer">
                        <label className="remember-me">
                            <input type="checkbox" />
                            <span>Recuérdame</span>
                        </label>
                        <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
                    </div>

                    <button className="submit-btn-final" type="submit" disabled={loading}>
                        {loading ? (
                            <div className="spinner"></div>
                        ) : (
                            isRegistering ? 'Crear cuenta' : 'Iniciar sesión'
                        )}
                    </button>
                </form>

                <p className="switch-mode">
                    {isRegistering ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
                    <button
                        type="button"
                        onClick={() => setIsRegistering(!isRegistering)}
                    >
                        {isRegistering ? 'Inicia sesión' : 'Regístrate gratis'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
