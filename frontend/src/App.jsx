import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { api } from './services/api'

// Pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import JoinPage from './pages/JoinPage'
import TaskListPage from './pages/TaskListPage'
import TaskDetailPage from './pages/TaskDetailPage'
import NewTaskPage from './pages/NewTaskPage'
import EditTaskPage from './pages/EditTaskPage'
import SettingsPage from './pages/SettingsPage'

function App() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const response = await api.get('/me')
            setUser(response.data)
        } catch (error) {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>読み込み中...</p>
            </div>
        )
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route
                    path="/login"
                    element={user ? <Navigate to="/" /> : <LoginPage onLogin={setUser} />}
                />
                <Route
                    path="/signup"
                    element={user ? <Navigate to="/" /> : <SignupPage onSignup={setUser} />}
                />

                {/* Protected routes */}
                <Route
                    path="/"
                    element={user ? <TaskListPage user={user} /> : <Navigate to="/login" />}
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
                    element={user ? <JoinPage user={user} onJoin={checkAuth} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/settings"
                    element={user ? <SettingsPage user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />}
                />
            </Routes>
        </BrowserRouter>
    )
}

export default App
