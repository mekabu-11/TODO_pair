import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
// import { api } from '../../services/api' // Will use later for fetching users/pages

function AdminDashboardPage({ user }) {
    const [stats, setStats] = useState({ users: 0, tasks: 0 })

    useEffect(() => {
        // Placeholder for fetching stats
        // async function fetchStats() {
        //     const { data } = await api.admin.getStats()
        //     setStats(data)
        // }
        // fetchStats()

        // Mock data for now
        setStats({ users: 12, tasks: 45 })
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
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>ページ管理</h2>
                <div className="table-container">
                    <p style={{ color: '#6b7280' }}>現在管理できるページはありません。</p>
                    {/* Table will go here */}
                </div>
            </section>
        </div>
    )
}

export default AdminDashboardPage
