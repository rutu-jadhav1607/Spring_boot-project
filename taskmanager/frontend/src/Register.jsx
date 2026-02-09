import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Loader2, Rocket } from 'lucide-react';
import api from './api';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/auth/register', { name, email, password });
            setMessage({ type: 'success', text: 'Account created! Redirecting to login...' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Registration failed. Email might already be in use.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', padding: '20px' }}>
            <div className="glass-card fade-in" style={{ padding: '48px', width: '100%', maxWidth: '440px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        background: 'linear-gradient(135deg, var(--success), #34d399)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.5)'
                    }}>
                        <Rocket color="white" size={36} />
                    </div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.02em' }}>Get Started</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Join our community of achievers</p>
                </div>

                {message.text && (
                    <div style={{
                        backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                        color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                        padding: '14px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="input-group">
                        <label><User size={16} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--success)' }} /> Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                    </div>
                    <div className="input-group">
                        <label><Mail size={16} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--success)' }} /> Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required />
                    </div>
                    <div className="input-group">
                        <label><Lock size={16} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--success)' }} /> Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn-primary" style={{
                        width: '100%',
                        height: '52px',
                        marginTop: '12px',
                        fontSize: '1rem',
                        background: 'linear-gradient(135deg, var(--success), #34d399)',
                        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
                    }} disabled={loading}>
                        {loading ? <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div> : (
                            <>
                                <UserPlus size={18} /> Create Account
                            </>
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--success)', textDecoration: 'none', fontWeight: '700' }}>Log In</Link>
                </p>
            </div>
            <style>
                {`
                    .animate-spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}
            </style>
        </div>
    );
};

export default Register;
