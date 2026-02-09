import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LayoutDashboard, Database, Activity, Trash2, ArrowLeft, Megaphone, Folder, Plus, Check, X, Edit3, BarChart2 } from 'lucide-react';
import api from './api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Forms state
    const [announcement, setAnnouncement] = useState({ title: '', content: '', type: 'INFO' });
    const [projectForm, setProjectForm] = useState({ name: '', description: '' });
    const [assignForm, setAssignForm] = useState({ title: '', description: '', userId: '', dueDate: '' });

    const navigate = useNavigate();

    useEffect(() => {
        fetchInitialData();
    }, [activeTab]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes, tasksRes, projectsRes] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/admin/users'),
                api.get('/admin/tasks'),
                api.get('/admin/projects')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setTasks(tasksRes.data);
            setProjects(projectsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/announcements', announcement);
            alert('Announcement posted!');
            setAnnouncement({ title: '', content: '', type: 'INFO' });
        } catch (err) { console.error(err); }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/projects', projectForm);
            fetchInitialData();
            setProjectForm({ name: '', description: '' });
        } catch (err) { console.error(err); }
    };

    const handleAssignTask = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/admin/tasks/assign?userId=${assignForm.userId}`, {
                title: assignForm.title,
                description: assignForm.description,
                dueDate: assignForm.dueDate
            });
            alert('Task assigned!');
            fetchInitialData();
            setAssignForm({ title: '', description: '', userId: '', dueDate: '' });
        } catch (err) { console.error(err); }
    };

    const handleApprove = async (id) => {
        try {
            const adminEmail = 'admin@jobhook.com';
            await api.put(`/admin/tasks/${id}/approve?adminEmail=${adminEmail}`);
            fetchInitialData();
        } catch (err) { console.error(err); }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/admin/tasks/${id}/reject`);
            fetchInitialData();
        } catch (err) { console.error(err); }
    };

    const handlePurge = async () => {
        if (window.confirm('Purge all approved tasks older than 30 days?')) {
            try {
                const res = await api.delete('/admin/tasks/purge-old');
                alert(res.data);
                fetchInitialData();
            } catch (err) { console.error(err); }
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'users':
                return (
                    <div className="glass-card fade-in" style={{ padding: '32px' }}>
                        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Users size={24} color="var(--primary)" /> Registered Users
                        </h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                                    <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                                    <th style={{ textAlign: 'left', padding: '12px' }}>Email</th>
                                    <th style={{ textAlign: 'left', padding: '12px' }}>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '12px' }}>{user.name}</td>
                                        <td style={{ padding: '12px' }}>{user.email}</td>
                                        <td style={{ padding: '12px' }}>{user.role}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'tasks':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Database size={24} color="var(--primary)" /> Global Oversight
                            </h2>
                            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {tasks.map(task => (
                                    <div key={task.id} style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{task.title}</p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assignee: {task.user?.name || 'Unassigned'}</p>
                                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                                <span className="badge" style={{ fontSize: '0.65rem' }}>{task.status}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {task.status === 'SUBMITTED' && (
                                                <>
                                                    <button onClick={() => handleApprove(task.id)} className="btn-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}><Check size={18} /></button>
                                                    <button onClick={() => handleReject(task.id)} className="btn-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)' }}><X size={18} /></button>
                                                </>
                                            )}
                                            <button onClick={() => api.delete(`/admin/tasks/${task.id}`).then(fetchInitialData)} className="btn-icon"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '32px', height: 'fit-content' }}>
                            <h3 style={{ marginBottom: '20px' }}>Assign New Task</h3>
                            <form onSubmit={handleAssignTask}>
                                <input className="input-field" placeholder="Task Title" value={assignForm.title} onChange={e => setAssignForm({ ...assignForm, title: e.target.value })} required />
                                <textarea className="input-field" placeholder="Description" value={assignForm.description} onChange={e => setAssignForm({ ...assignForm, description: e.target.value })} style={{ minHeight: '80px', margin: '12px 0' }} required />
                                <select className="input-field" value={assignForm.userId} onChange={e => setAssignForm({ ...assignForm, userId: e.target.value })} style={{ marginBottom: '12px' }} required>
                                    <option value="">Select User</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                <input type="date" className="input-field" value={assignForm.dueDate} onChange={e => setAssignForm({ ...assignForm, dueDate: e.target.value })} style={{ marginBottom: '20px' }} />
                                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Assign Task</button>
                            </form>
                        </div>
                    </div>
                );
            case 'utility':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <h2 style={{ marginBottom: '24px' }}><Megaphone size={24} color="var(--primary)" /> Global Announcement</h2>
                            <form onSubmit={handlePostAnnouncement}>
                                <input className="input-field" placeholder="Announcement Title" value={announcement.title} onChange={e => setAnnouncement({ ...announcement, title: e.target.value })} required />
                                <textarea className="input-field" placeholder="Message content..." value={announcement.content} onChange={e => setAnnouncement({ ...announcement, content: e.target.value })} style={{ minHeight: '120px', margin: '16px 0' }} required />
                                <select className="input-field" value={announcement.type} onChange={e => setAnnouncement({ ...announcement, type: e.target.value })} style={{ marginBottom: '24px' }}>
                                    <option value="INFO">Information</option>
                                    <option value="WARNING">Important Alert</option>
                                    <option value="SUCCESS">Good News</option>
                                </select>
                                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Broadcast Message</button>
                            </form>
                        </div>
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <h2 style={{ marginBottom: '24px' }}><Activity size={24} color="var(--primary)" /> System Stats</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="stat-box" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <p style={{ color: 'var(--text-muted)' }}>Total Users</p>
                                    <p style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.totalUsers}</p>
                                </div>
                                <div className="stat-box" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <p style={{ color: 'var(--text-muted)' }}>Total Tasks</p>
                                    <p style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.totalTasks}</p>
                                </div>
                                <div className="stat-box" style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid var(--success)' }}>
                                    <p style={{ color: 'var(--success)' }}>Approved</p>
                                    <p style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.completedTasks}</p>
                                </div>
                                <div className="stat-box" style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '12px', border: '1px solid var(--warning)' }}>
                                    <p style={{ color: 'var(--warning)' }}>To Review</p>
                                    <p style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.pendingTasks}</p>
                                </div>
                            </div>
                            <button onClick={handlePurge} className="glass-card" style={{ width: '100%', marginTop: '32px', padding: '16px', color: 'var(--error)', border: '1px solid var(--error)', cursor: 'pointer', fontWeight: '700' }}>
                                <Trash2 size={18} /> Purge Old Data
                            </button>
                        </div>
                    </div>
                );
            case 'projects':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <h2 style={{ marginBottom: '24px' }}><Folder size={24} color="var(--primary)" /> Running Projects</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {projects.map(p => (
                                    <div key={p.id} className="glass-card" style={{ padding: '20px', border: '1px solid var(--glass-border)' }}>
                                        <h3 style={{ color: 'white' }}>{p.name}</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>{p.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '32px', height: 'fit-content' }}>
                            <h3 style={{ marginBottom: '20px' }}>Create Project</h3>
                            <form onSubmit={handleCreateProject}>
                                <input className="input-field" placeholder="Project Name" value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} required />
                                <textarea className="input-field" placeholder="Scope & Details" value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} style={{ minHeight: '100px', marginTop: '12px', marginBottom: '20px' }} required />
                                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Launch Project</button>
                            </form>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
            <header style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <button onClick={() => navigate('/dashboard')} className="glass-card" style={{ padding: '10px', color: 'var(--text-main)', cursor: 'pointer' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Workspace</h1>
                </div>

                <nav style={{ display: 'flex', gap: '12px' }}>
                    {[
                        { id: 'users', label: 'Users', icon: Users },
                        { id: 'tasks', label: 'Oversight', icon: Database },
                        { id: 'utility', label: 'Utility', icon: Activity },
                        { id: 'projects', label: 'Projects', icon: Folder }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="glass-card"
                            style={{
                                padding: '12px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.01)',
                                border: activeTab === tab.id ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)'
                            }}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </nav>
            </header>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>Loading workspace...</div>
            ) : (
                renderTabContent()
            )}

            <style>{`
                .input-field {
                    width: 100%;
                    padding: 12px 16px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    color: white;
                    font-family: inherit;
                }
                .input-field:focus { outline: none; border-color: var(--primary); }
                .btn-icon {
                    padding: 8px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    color: var(--text-muted);
                    background: rgba(255,255,255,0.05);
                }
                .badge {
                    padding: 2px 8px;
                    border-radius: 4px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    font-weight: 700;
                }
                .fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
