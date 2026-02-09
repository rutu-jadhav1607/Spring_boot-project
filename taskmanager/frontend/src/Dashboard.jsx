import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, CheckCircle, Clock, Trash2, Edit3, LayoutDashboard, X, Calendar, AlignLeft, Check, Database, Megaphone, Send, ShieldCheck } from 'lucide-react';
import api from './api';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', status: 'PENDING', dueDate: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role');
    const userName = localStorage.getItem('name');
    const userEmail = localStorage.getItem('email');

    useEffect(() => {
        fetchTasks();
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/tasks/announcements');
            setAnnouncements(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await api.get('/tasks');
            setTasks(res.data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 403) navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', newTask);
            setIsAdding(false);
            setNewTask({ title: '', description: '', status: 'PENDING', dueDate: '' });
            fetchTasks();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await api.delete(`/tasks/${id}`);
                fetchTasks();
            } catch (err) { console.error(err); }
        }
    };

    const toggleStatus = async (task) => {
        const updatedTask = {
            ...task,
            status: task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
        };
        try {
            await api.put(`/tasks/${task.id}`, updatedTask);
            fetchTasks();
        } catch (err) { console.error(err); }
    };

    const handleSubmitForApproval = async (task) => {
        try {
            await api.put(`/tasks/${task.id}`, { ...task, status: 'SUBMITTED' });
            alert('Task submitted for Admin approval!');
            fetchTasks();
        } catch (err) { console.error(err); }
    };

    const handleApprove = async (task) => {
        try {
            const adminEmail = userEmail || 'admin@jobhook.com';
            await api.put(`/admin/tasks/${task.id}/approve?adminEmail=${adminEmail}`);
            alert('Task Approved!');
            fetchTasks();
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        navigate('/login');
    };

    return (
        <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '60px',
                animation: 'fadeIn 0.8s ease'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        padding: '12px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)'
                    }}>
                        <LayoutDashboard size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Hello, {userName || 'User'}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Manage your daily goals effectively</p>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                background: userRole === 'ADMIN' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                color: userRole === 'ADMIN' ? 'var(--primary)' : 'var(--text-muted)',
                                border: `1px solid ${userRole === 'ADMIN' ? 'var(--primary)' : 'var(--glass-border)'}`,
                                textTransform: 'uppercase'
                            }}>
                                {userRole || 'USER'}
                            </span>
                            {userRole === 'ADMIN' && (
                                <button
                                    onClick={() => navigate('/admin-dashboard')}
                                    className="glass-card"
                                    style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.7rem',
                                        fontWeight: '700',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        color: 'var(--success)',
                                        border: '1px solid var(--success)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Database size={12} /> Admin Portal
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button className="glass-card" onClick={handleLogout} style={{
                        padding: '10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        color: 'var(--text-main)',
                        background: 'rgba(255,255,255,0.05)'
                    }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            {announcements.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                    {announcements.map(ann => (
                        <div key={ann.id} className="glass-card fade-in" style={{
                            padding: '16px 24px',
                            marginBottom: '12px',
                            background: ann.type === 'WARNING' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                            border: `1px solid ${ann.type === 'WARNING' ? 'var(--error)' : 'var(--primary)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}>
                            <Megaphone size={20} color={ann.type === 'WARNING' ? 'var(--error)' : 'var(--primary)'} />
                            <div>
                                <strong style={{ color: 'white' }}>{ann.title}</strong>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{ann.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
                    {userRole === 'ADMIN' && (
                        <div className="glass-card fade-in" style={{
                            padding: '40px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderStyle: 'dashed',
                            background: 'rgba(255, 255, 255, 0.01)',
                            cursor: 'pointer',
                            minHeight: '260px'
                        }} onClick={() => setIsAdding(true)}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'rgba(99, 102, 241, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                                border: '1px solid var(--primary)'
                            }}>
                                <Plus size={32} color="var(--primary)" />
                            </div>
                            <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>Add New Task</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Click to create a new board</p>
                        </div>
                    )}

                    {tasks.map((task, index) => (
                        <div key={task.id} className="glass-card fade-in" style={{
                            padding: '32px',
                            position: 'relative',
                            animationDelay: `${index * 0.1}s`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div
                                    onClick={() => (task.status === 'PENDING' || task.status === 'COMPLETED' || task.status === 'REJECTED') && toggleStatus(task)}
                                    style={{
                                        padding: '6px 16px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: '700',
                                        background:
                                            task.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' :
                                                task.status === 'SUBMITTED' ? 'rgba(99, 102, 241, 0.2)' :
                                                    task.status === 'COMPLETED' ? 'rgba(6, 182, 212, 0.1)' :
                                                        task.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' :
                                                            'rgba(245, 158, 11, 0.1)',
                                        color:
                                            task.status === 'APPROVED' ? 'var(--success)' :
                                                task.status === 'SUBMITTED' ? 'var(--primary)' :
                                                    task.status === 'COMPLETED' ? '#06b6d4' :
                                                        task.status === 'REJECTED' ? 'var(--error)' :
                                                            'var(--warning)',
                                        border: `1px solid ${task.status === 'APPROVED' ? 'var(--success)' :
                                            task.status === 'SUBMITTED' ? 'var(--primary)' :
                                                task.status === 'COMPLETED' ? '#06b6d4' :
                                                    task.status === 'REJECTED' ? 'var(--error)' :
                                                        'var(--warning)'
                                            }`,
                                        cursor: (task.status === 'SUBMITTED' || task.status === 'APPROVED') ? 'default' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {task.status === 'APPROVED' ? <ShieldCheck size={14} /> :
                                        task.status === 'SUBMITTED' ? <Send size={14} /> :
                                            task.status === 'COMPLETED' ? <CheckCircle size={14} /> :
                                                <Clock size={14} />}
                                    {task.status}
                                </div>
                                {userRole === 'ADMIN' && (
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 0.2s' }} onClick={() => handleDelete(task.id)} className="hover-error">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <h3 style={{
                                fontSize: '1.4rem',
                                fontWeight: '700',
                                marginBottom: '12px',
                                color: (task.status === 'COMPLETED' || task.status === 'APPROVED' || task.status === 'SUBMITTED') ? 'var(--text-muted)' : 'white',
                                textDecoration: (task.status === 'COMPLETED' || task.status === 'APPROVED' || task.status === 'SUBMITTED') ? 'line-through' : 'none'
                            }}>{task.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '28px', lineHeight: '1.6' }}>{task.description}</p>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingTop: '20px',
                                borderTop: '1px solid var(--glass-border)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <Calendar size={16} color="var(--primary)" /> {task.dueDate || 'No Deadline'}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {task.status === 'COMPLETED' && (
                                        <button
                                            onClick={() => handleSubmitForApproval(task)}
                                            className="btn-primary"
                                            style={{ padding: '6px 12px', fontSize: '0.75rem', height: 'fit-content' }}
                                        >
                                            Submit for Approval
                                        </button>
                                    )}
                                    {task.status === 'APPROVED' && (
                                        <div style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Check size={14} /> Approved
                                        </div>
                                    )}
                                    {task.status === 'SUBMITTED' && userRole === 'ADMIN' && (
                                        <button
                                            onClick={() => handleApprove(task)}
                                            className="btn-primary"
                                            style={{ padding: '6px 12px', fontSize: '0.75rem', height: 'fit-content', background: 'var(--success)', borderColor: 'var(--success)' }}
                                        >
                                            Approve Task
                                        </button>
                                    )}
                                    {task.status !== 'COMPLETED' && task.status !== 'APPROVED' && task.status !== 'SUBMITTED' && (
                                        <button
                                            onClick={() => toggleStatus(task)}
                                            style={{ background: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '6px', color: 'white', cursor: 'pointer' }}
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isAdding && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
                    <div className="glass-card" style={{ padding: '48px', width: '100%', maxWidth: '560px', position: 'relative' }}>
                        <button
                            onClick={() => setIsAdding(false)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <X size={24} />
                        </button>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '32px' }}>New Task</h2>
                        <form onSubmit={handleCreate}>
                            <div className="input-group">
                                <label><AlignLeft size={16} style={{ marginRight: '8px' }} /> Title</label>
                                <input type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="What needs to be done?" required />
                            </div>
                            <div className="input-group">
                                <label><Plus size={16} style={{ marginRight: '8px' }} /> Description</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    placeholder="Enter details..."
                                    required
                                    style={{
                                        width: '100%',
                                        minHeight: '120px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        padding: '12px 16px',
                                        color: 'var(--text-main)',
                                        fontFamily: 'inherit',
                                        resize: 'none'
                                    }}
                                />
                            </div>
                            <div className="input-group">
                                <label><Calendar size={16} style={{ marginRight: '8px' }} /> Due Date</label>
                                <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
                                <button type="button" className="glass-card" style={{ flex: 1, padding: '14px', fontWeight: '600', color: 'var(--text-main)', cursor: 'pointer' }} onClick={() => setIsAdding(false)}>Discard</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '14px' }}>Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style>
                {`
                    .hover-error:hover { color: var(--error) !important; transform: scale(1.1); }
                    .animate-spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}
            </style>
        </div>
    );
};

export default Dashboard;
