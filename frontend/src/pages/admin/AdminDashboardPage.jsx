import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

function AdminDashboardPage({ user }) {
    const [stats, setStats] = useState({ users: 0, tasks: 0 })
    const [users, setUsers] = useState([])

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch profiles (users)
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (profilesError) throw profilesError

                // Fetch tasks count (approximate or exact)
                const { count: tasksCount, error: tasksError } = await supabase
                    .from('tasks')
                    .select('*', { count: 'exact', head: true })

                if (tasksError) console.error('Error fetching tasks count:', tasksError)

                setStats({
                    users: profiles ? profiles.length : 0,
                    tasks: tasksCount || 0
                })
                setUsers(profiles || [])
            } catch (error) {
                console.error('Error fetching admin data:', error)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="page" style={{ padding: '2rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>管理画面</h1>
                <Link to="/" className="btn-secondary">タスク一覧へ戻る</Link>
            </header>

            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>総ユーザー数</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{stats.users}</p>
                </div>
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>総タスク数</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{stats.tasks}</p>
                </div>
            </div>

            <section className="admin-section" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>ユーザー一覧</h2>
                    <a
                        href="https://supabase.com/dashboard/project/_/auth/users"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', textDecoration: 'none', background: '#2563eb', color: 'white', borderRadius: '4px' }}
                    >
                        Supabaseでユーザー管理
                    </a>
                </div>
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                                <th style={{ padding: '0.75rem' }}>名前</th>
                                <th style={{ padding: '0.75rem' }}>ID</th>
                                <th style={{ padding: '0.75rem' }}>権限</th>
                                <th style={{ padding: '0.75rem' }}>登録日</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>ユーザーが見つかりません</td>
                                </tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.75rem' }}>{u.name || 'No Name'}</td>
                                        <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#6b7280' }}>{u.id.substring(0, 8)}...</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                background: u.role === 'admin' ? '#fee2e2' : '#d1fae5',
                                                color: u.role === 'admin' ? '#991b1b' : '#065f46'
                                            }}>
                                                {u.role || 'user'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}

export default AdminDashboardPage
