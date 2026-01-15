import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, Chrome, UserPlus, Sparkles } from 'lucide-react';
import '../styles/login-modern.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);

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
                alert('¡Registro exitoso! Por favor revisa tu correo para confirmar (si está activado en Supabase).');
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
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) setError(error.message);
    };

    return (
        <div className="login-container-modern">
            {/* Animated Background */}
            <div className="login-bg-animation">
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
            </div>

            <div className="login-card-modern glass-card-modern animate-fade-in">
                {/* Logo Section */}
                <div className="logo-section">
                    <img src="/logo-lapregilda.jpg" alt="LAPREGILDA" className="login-logo-modern" />
                    <div className="tagline">
                        <Sparkles size={16} className="sparkle-icon" />
                        <span>Tu camino al IESTP Gilda Ballivián Rosado</span>
                        <Sparkles size={16} className="sparkle-icon" />
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${!isRegistering ? 'active' : ''}`}
                        onClick={() => setIsRegistering(false)}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        className={`auth-tab ${isRegistering ? 'active' : ''}`}
                        onClick={() => setIsRegistering(true)}
                    >
                        Registrarse
                    </button>
                </div>

                <form onSubmit={handleAuth} className="auth-form">
                    <div className="input-group-modern">
                        <Mail size={20} className="input-icon" />
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group-modern">
                        <Lock size={20} className="input-icon" />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message-modern">{error}</div>}

                    <button className="btn-modern btn-primary-modern" disabled={loading}>
                        {loading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            <>
                                {isRegistering ? 'Crear Cuenta' : 'Entrar'}
                                {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
                            </>
                        )}
                    </button>
                </form>

                <div className="divider-modern">
                    <span>o continúa con</span>
                </div>

                <button className="btn-modern btn-google" onClick={handleGoogleLogin}>
                    <Chrome size={20} />
                    Google
                </button>

                <p className="footer-text">
                    {isRegistering
                        ? '¿Ya tienes cuenta? '
                        : '¿Primera vez aquí? '}
                    <button className="link-button" onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? 'Inicia sesión' : 'Regístrate gratis'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
