import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { api } from './services/api'
import { supabase } from './lib/supabase'

// Pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import JoinPage from './pages/JoinPage'
import TaskListPage from './pages/TaskListPage'
import TaskDetailPage from './pages/TaskDetailPage'
import NewTaskPage from './pages/NewTaskPage'
import EditTaskPage from './pages/EditTaskPage'
import SettingsPage from './pages/SettingsPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import ErrorBoundary from './components/ErrorBoundary'
import AdminRoute from './components/AdminRoute'

function App() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Check for Supabase configuration
    if (!supabase) {
        return (
            <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
                <h1 style={{ color: '#ef4444' }}>Supabase設定が必要です</h1>
                <p>アプリケーションを開始するには、Supabaseの接続情報が必要です。</p>
                <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <h3>設定手順:</h3>
                    <ol>
                        <li>プロジェクトのルートにある <code>.env</code> ファイルを開く（なければ作成）</li>
                        <li>以下の変数を設定する:</li>
                    </ol>
                    <pre style={{ background: '#1f2937', color: '#fff', padding: '1rem', borderRadius: '4px', overflowX: 'auto' }}>
                        VITE_SUPABASE_URL=your_project_url (必須: Project URL)
                        VITE_SUPABASE_API_KEY=your_anon_key (必須: API Key)
                    </pre>
                </div>
                <p>※ <code>VITE_SUPABASE_SERCRETS_KEY</code> もキーとして認識されますが、URLの設定が別途必要です。</p>
            </div>
        )
    }

    useEffect(() => {
        let mounted = true;

        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session && mounted) {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user && mounted) {
                    // Fetch full profile including custom fields
                    try {
                        const { data } = await api.auth.me()
                        if (mounted) setUser(data.user)
                    } catch (e) {
                        console.error('Failed to fetch user profile', e)
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                if (mounted) setUser(null)
            }
            if (mounted) setLoading(false)
        })

        // Safety timeout
        const timer = setTimeout(() => {
            if (mounted && loading) {
                console.warn('App: Auth check timed out, forcing loading false');
                setLoading(false)
            }
        }, 3000)

        return () => {
            mounted = false;
            clearTimeout(timer)
            authListener.subscription.unsubscribe()
        }
    }, [])

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>読み込み中...</p>
            </div>
        )
    }

    return (
        <HashRouter>
            <Routes>
                {/* Public routes */}
                <Route
                    path="/login"
                    element={user ? <Navigate to="/" /> : <LoginPage onLogin={setUser} />}
                />
                {/* Signup route disabled for public access */}
                {/* <Route
                    path="/signup"
                    element={user ? <Navigate to="/" /> : <SignupPage onSignup={setUser} />}
                /> */}

                {/* Protected routes */}
                <Route
                    path="/"
                    element={user ? (
                        <ErrorBoundary key="task-list">
                            <TaskListPage user={user} />
                        </ErrorBoundary>
                    ) : <Navigate to="/login" />}
                />
                <Route
                    path="/tasks/new"
                    element={user ? <NewTaskPage user={user} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/tasks/:id"
                    element={user ? <TaskDetailPage user={user} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/tasks/:id/edit"
                    element={user ? <EditTaskPage user={user} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/join"
                    element={user ? <JoinPage user={user} onJoin={() => checkAuth()} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/settings"
                    element={user ? <SettingsPage user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />}
                />

                {/* Admin routes */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute user={user}>
                            <AdminDashboardPage user={user} />
                        </AdminRoute>
                    }
                />
            </Routes>
        </HashRouter>
    )
}

export default App
