import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tasksApi, subtasksApi } from '../services/api'
import iconCheck from '../assets/images/icon_check.png'
import BottomNavigation from '../components/BottomNavigation'

function TaskListPage({ user }) {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [expandedTasks, setExpandedTasks] = useState({})

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

    const toggleTask = async (taskId, currentStatus, subtasks = []) => {
        try {
            const newStatus = !currentStatus
            await tasksApi.complete(taskId, newStatus)

            // サブタスクがあれば全て同じ状態にする
            if (subtasks.length > 0) {
                await Promise.all(
                    subtasks.map(st => subtasksApi.update(st.id, newStatus))
                )
            }

            loadTasks()
        } catch (error) {
            console.error('Failed to toggle task:', error)
        }
    }

    const toggleSubtask = async (subtaskId, currentStatus, e) => {
        e.stopPropagation()
        try {
            await subtasksApi.update(subtaskId, !currentStatus)
            loadTasks()
        } catch (error) {
            console.error('Failed to toggle subtask:', error)
        }
    }

    const toggleExpanded = (taskId) => {
        setExpandedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }))
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
                        <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                            <div className="task-header">
                                {/* 三角アイコン（サブタスクがある場合のみ表示） */}
                                {task.subtasks_count > 0 && (
                                    <button
                                        className="expand-btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleExpanded(task.id)
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '0 4px',
                                            fontSize: '12px',
                                            color: 'var(--gray-400)',
                                            transition: 'transform 0.2s',
                                            transform: expandedTasks[task.id] ? 'rotate(90deg)' : 'rotate(0deg)'
                                        }}
                                        aria-label={expandedTasks[task.id] ? 'サブタスクを折りたたむ' : 'サブタスクを展開'}
                                    >
                                        ▶
                                    </button>
                                )}

                                <button
                                    className={`checkbox ${task.completed ? 'checked' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleTask(task.id, task.completed, task.subtasks || [])
                                    }}
                                >
                                    {task.completed && <img src={iconCheck} alt="✓" />}
                                </button>

                                <div className="task-content">
                                    <Link to={`/tasks/${task.id}`} className="task-link">
                                        <h3 className="task-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {task.title}
                                            {/* 進捗率表示（サブタスクがある場合のみ） */}
                                            {task.subtasks_count > 0 && (
                                                <span style={{
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    color: task.progress === 100 ? 'var(--green-600)' : 'var(--gray-500)',
                                                    background: task.progress === 100 ? 'var(--green-50)' : 'var(--gray-100)',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {task.completed_subtasks}/{task.subtasks_count} ({task.progress}%)
                                                </span>
                                            )}
                                        </h3>
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

                            {/* サブタスク一覧（展開時のみ表示） */}
                            {task.subtasks_count > 0 && expandedTasks[task.id] && (
                                <div className="subtasks-list" style={{
                                    marginTop: '12px',
                                    paddingTop: '12px',
                                    borderTop: '1px solid var(--gray-100)',
                                    marginLeft: '36px'
                                }}>
                                    {task.subtasks.map(subtask => (
                                        <div
                                            key={subtask.id}
                                            className="subtask-item"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '6px 0'
                                            }}
                                        >
                                            <button
                                                className={`checkbox ${subtask.completed ? 'checked' : ''}`}
                                                onClick={(e) => toggleSubtask(subtask.id, subtask.completed, e)}
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    minWidth: '20px'
                                                }}
                                            >
                                                {subtask.completed && <img src={iconCheck} alt="✓" style={{ width: '10px', height: '10px' }} />}
                                            </button>
                                            <span style={{
                                                fontSize: '14px',
                                                color: subtask.completed ? 'var(--gray-400)' : 'var(--gray-700)',
                                                textDecoration: subtask.completed ? 'line-through' : 'none'
                                            }}>
                                                {subtask.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
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
