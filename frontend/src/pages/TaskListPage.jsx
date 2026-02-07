import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tasksApi } from '../services/api'
import iconSubtask from '../assets/images/icon_subtask.png'
import iconEdit from '../assets/images/icon_edit.png'
import iconCheck from '../assets/images/icon_check.png'
import iconComment from '../assets/images/icon_comment.png'
import iconAdd from '../assets/images/icon_add.png'
// iconSettings will be generated later

function TaskListPage({ user, onLogout }) {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, incomplete, completed, mine
    const [expandedTasks, setExpandedTasks] = useState(new Set()) // Track expanded tasks

    useEffect(() => {
        loadTasks()
    }, [filter])

    const loadTasks = async () => {
        try {
            const response = await tasksApi.list({ status: filter === 'mine' ? undefined : filter, assignee_id: filter === 'mine' ? user.id : undefined })
            setTasks(response.data)
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

    const toggleExpand = (taskId, e) => {
        e.stopPropagation()
        setExpandedTasks(prev => {
            const newSet = new Set(prev)
            if (newSet.has(taskId)) {
                newSet.delete(taskId)
            } else {
                newSet.add(taskId)
            }
            return newSet
        })
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        )
    }

    return (
        <div className="page">
            <header className="header">
                <div className="container header-content">
                    <h1 className="logo">ふたりのTODO</h1>
                    <div className="user-menu">
                        <span className={`avatar ${user.color}`}>
                            {user.name.charAt(0)}
                        </span>
                        {/* Settings icon placeholder until generated */}
                        <button onClick={onLogout} className="logout-btn" style={{ fontSize: '20px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}>
                            ⚙️
                        </button>
                    </div>
                </div>
            </header>

            <main className="container">
                <div className="filter-tabs">
                    <button
                        className={`tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        すべて
                    </button>
                    <button
                        className={`tab ${filter === 'incomplete' ? 'active' : ''}`}
                        onClick={() => setFilter('incomplete')}
                    >
                        未完了
                    </button>
                    <button
                        className={`tab ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        完了
                    </button>
                    <button
                        className={`tab ${filter === 'mine' ? 'active' : ''}`}
                        onClick={() => setFilter('mine')}
                    >
                        自分担当
                    </button>
                </div>

                <div className="task-list">
                    {tasks.map(task => {
                        const hasSubtasks = task.subtasks_count > 0
                        const isExpanded = expandedTasks.has(task.id)

                        return (
                            <div key={task.id} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="task-card">
                                    <div
                                        className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleTask(task.id, task.completed)
                                        }}
                                        style={{
                                            backgroundImage: task.completed ? `url(${iconCheck})` : 'none',
                                            backgroundSize: '80%',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center'
                                        }}
                                    >
                                    </div>

                                    <Link to={`/tasks/${task.id}`} className="task-content">
                                        <h3 className={`task-title ${task.completed ? 'completed' : ''}`}>
                                            {task.title}
                                        </h3>
                                        <div className="task-meta">
                                            {task.category && (
                                                <span className={`category-badge ${task.category}`}>
                                                    {task.category === 'money' ? '💰 お金' :
                                                        task.category === 'procedure' ? '📋 手続き' :
                                                            task.category === 'event' ? '🎉 イベント' :
                                                                task.category === 'health' ? '🏥 健康' : '📦 その他'}
                                                </span>
                                            )}
                                            {task.due_date && (
                                                <span className="due-date">
                                                    📅 {new Date(task.due_date).toLocaleDateString('ja-JP')}
                                                </span>
                                            )}
                                            {task.assignee && (
                                                <span className="assignee">
                                                    <span className={`assignee-dot ${task.assignee.color}`}></span>
                                                    {task.assignee.name}
                                                </span>
                                            )}
                                        </div>
                                    </Link>

                                    <div className="task-actions">
                                        {hasSubtasks && (
                                            <button
                                                onClick={(e) => toggleExpand(task.id, e)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    fontSize: '14px',
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                    color: 'var(--gray-500)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                {isExpanded ? '▲' : '▼'} {task.subtasks_count}
                                            </button>
                                        )}
                                        {task.comments_count > 0 && (
                                            <span className="comment-count" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--gray-500)' }}>
                                                <img src={iconComment} alt="comments" style={{ width: '16px', height: '16px' }} />
                                                {task.comments_count}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Subtasks List */}
                                {isExpanded && task.subtasks && (
                                    <div style={{
                                        borderTop: '1px solid var(--gray-100)',
                                        backgroundColor: 'var(--gray-50)',
                                        borderBottomLeftRadius: '12px',
                                        borderBottomRightRadius: '12px',
                                        padding: '8px 16px'
                                    }}>
                                        <div style={{
                                            marginBottom: '8px',
                                            fontSize: '12px',
                                            color: 'var(--gray-500)',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <img src={iconSubtask} alt="subtasks" style={{ width: '16px', height: '16px' }} />
                                            サブタスク
                                        </div>
                                        {task.subtasks.map(subtask => (
                                            <div key={subtask.id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 0',
                                                borderBottom: '1px solid var(--gray-100)'
                                            }}>
                                                <div
                                                    style={{
                                                        width: '6px',
                                                        height: '6px',
                                                        borderRadius: '50%',
                                                        backgroundColor: subtask.completed ? 'var(--success-color, #22c55e)' : 'var(--gray-300)',
                                                        marginLeft: '4px'
                                                    }}
                                                />
                                                <span style={{
                                                    fontSize: '13px',
                                                    color: subtask.completed ? 'var(--gray-400)' : 'var(--text-primary)',
                                                    textDecoration: subtask.completed ? 'line-through' : 'none',
                                                    flex: 1
                                                }}>
                                                    {subtask.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {tasks.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <img src={iconEdit} alt="empty" style={{ width: '48px', height: '48px', opacity: 0.5 }} />
                            </div>
                            <p>タスクがありません</p>
                            <p className="empty-subtitle">右下のボタンから新しいタスクを追加しましょう</p>
                        </div>
                    )}
                </div>

                <Link to="/tasks/new" className="fab" style={{
                    backgroundColor: 'white',
                    border: '2px solid var(--primary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img
                        src={iconAdd}
                        alt="add"
                        style={{
                            width: '24px',
                            height: '24px'
                        }}
                    />
                </Link>
            </main>
        </div>
    )
}

export default TaskListPage
