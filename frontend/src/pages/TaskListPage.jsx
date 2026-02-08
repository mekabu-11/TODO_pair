import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tasksApi } from '../services/api'
import iconCheck from '../assets/images/icon_check.png'
import BottomNavigation from '../components/BottomNavigation'

function TaskListPage({ user }) {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        loadTasks()
    }, [filter])

    const loadTasks = async () => {
        try {
            const params = {}
            if (filter === 'incomplete') params.status = 'incomplete'
            if (filter === 'completed') params.status = 'completed'
            if (filter === 'mine') params.assignee_id = user.id

            const response = await tasksApi.list(params)
            setTasks(response.data.tasks || [])
        } catch (error) {
            console.error('Failed to load tasks:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleTask = async (taskId, currentStatus) => {
        try {
            await tasksApi.complete(taskId, !currentStatus)
            loadTasks()
        } catch (error) {
            console.error('Failed to toggle task:', error)
        }
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="page">
            {/* Header */}
            <header className="header">
                <div className="container header-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1 className="logo">ふたりのTODO</h1>
                        <span style={{
                            background: user.couple_id ? '#fce4ec' : '#e3f2fd',
                            color: user.couple_id ? '#c2185b' : '#1565c0',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            border: `1px solid ${user.couple_id ? '#f48fb1' : '#90caf9'}`
                        }}>
                            {user.couple_id ? '👫 ペアモード' : '👤 個人モード'}
                        </span>
                    </div>
                    <div className="user-menu">
                        <span className={`avatar ${user.color || 'blue'}`}>
                            {(user.name || user.email || '?').charAt(0).toUpperCase()}
                        </span>
                        <Link to="/settings" style={{ fontSize: '20px', textDecoration: 'none' }}>
                            ⚙️
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container">
                {/* Filter Buttons */}
                <div className="filters">
                    {['all', 'incomplete', 'mine', 'completed'].map(f => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === 'all' ? 'すべて' :
                                f === 'incomplete' ? '未完了' :
                                    f === 'mine' ? '自分担当' : '完了済み'}
                        </button>
                    ))}
                </div>

                {/* Task List */}
                <div className="task-list">
                    {tasks.map(task => (
                        <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                            <div className="task-header">
                                <button
                                    className={`checkbox ${task.completed ? 'checked' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleTask(task.id, task.completed)
                                    }}
                                >
                                    {task.completed && <img src={iconCheck} alt="✓" />}
                                </button>

                                <div className="task-content">
                                    <Link to={`/tasks/${task.id}`} className="task-link">
                                        <h3 className="task-title">{task.title}</h3>
                                    </Link>
                                    <div className="task-meta">
                                        {task.due_date && (
                                            <span className={`meta-item ${new Date(task.due_date) < new Date() ? 'overdue' : ''}`}>
                                                📅 {new Date(task.due_date).toLocaleDateString('ja-JP')}
                                            </span>
                                        )}
                                        {task.assignee && (
                                            <span className="meta-item">
                                                👤 {task.assignee.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {tasks.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">📝</div>
                            <p>タスクがありません</p>
                            <p className="empty-subtitle">右下の＋ボタンから新しいタスクを追加しましょう</p>
                        </div>
                    )}
                </div>

                {/* FAB */}
                <Link to="/tasks/new" className="fab">
                    +
                </Link>
            </main>

            <BottomNavigation />
        </div>
    )
}

export default TaskListPage
