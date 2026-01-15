import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card glass-card animate-fade-in">
                <h1 className="gradient-text">Apolo LMS</h1>
                <p className="subtitle">Bienvenido al futuro de la educación</p>

                <form onSubmit={handleLogin}>
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
                        {loading ? 'Entrando...' : 'Iniciar Sesión'}
                        <LogIn size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
