import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, Chrome, UserPlus } from 'lucide-react';

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
                            full_name: email.split('@')[0], // Default name
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
        <div className="login-container">
            <div className="login-card glass-card animate-fade-in">
                <div className="logo-container">
                    <img src="/logo-lapregilda.jpg" alt="LAPREGILDA" className="login-logo" />
                </div>
                <h1 className="gradient-text">LAPREGILDA</h1>
                <p className="subtitle">
                    {isRegistering
                        ? 'Crea tu cuenta de estudiante'
                        : 'Centro de Preparación Académica - IESTP Gilda Ballivián Rosado'}
                </p>

                <form onSubmit={handleAuth}>
                    <div className="input-group">
                        <Mail size={18} />
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <Lock size={18} />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}

                    <button className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Procesando...' : (isRegistering ? 'Registrarse' : 'Iniciar Sesión')}
                        {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
                    </button>
                </form>

                <div className="divider">
                    <span>o continúa con</span>
                </div>

                <button className="btn btn-outline w-full" onClick={handleGoogleLogin}>
                    <Chrome size={20} />
                    Google
                </button>

                <p className="toggle-auth">
                    {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                    <button onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? 'Inicia sesión' : 'Regístrate aquí'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
