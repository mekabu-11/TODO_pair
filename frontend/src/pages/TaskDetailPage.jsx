import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { tasksApi, commentsApi } from '../services/api'
import { ConfirmModal } from '../components/ui/SharedDialogs'
import iconSubtask from '../assets/images/icon_subtask.png'
import iconEdit from '../assets/images/icon_edit.png'
import iconDelete from '../assets/images/icon_delete.png'
import iconCheck from '../assets/images/icon_check.png'
import iconAdd from '../assets/images/icon_add.png'
import iconComment from '../assets/images/icon_comment.png'

const CATEGORIES = {
    money: { label: '💰 お金', className: 'money' },
    procedure: { label: '📋 手続き', className: 'procedure' },
    event: { label: '🎉 イベント', className: 'event' },
    health: { label: '🏥 健康', className: 'health' },
    other: { label: '📦 その他', className: 'other' }
}

const PRIORITIES = {
    1: '低',
    2: '中',
    3: '高'
}

function TaskDetailPage({ user }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const [task, setTask] = useState(null)
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState('')
    const [newSubtask, setNewSubtask] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Delete confirmation states
    const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false)
    const [deletingSubtask, setDeletingSubtask] = useState(null)

    useEffect(() => {
        loadTask()
    }, [id])

    const loadTask = async () => {
        try {
            const response = await tasksApi.get(id)
            setTask(response.data)
        } catch (error) {
            console.error('Failed to load task:', error)
            navigate('/')
        } finally {
            setLoading(false)
        }
    }

    const handleComplete = async () => {
        try {
            await tasksApi.complete(id, !task.completed)
            loadTask()
        } catch (error) {
            console.error('Failed to toggle task:', error)
        }
    }

    const handleDelete = async () => {
        try {
            await tasksApi.delete(id)
            setShowDeleteTaskModal(false)
            navigate('/')
        } catch (error) {
            console.error('Failed to delete task:', error)
        }
    }

    const handleDeleteSubtask = async () => {
        if (!deletingSubtask) return
        try {
            await tasksApi.delete(deletingSubtask.id)
            setDeletingSubtask(null)
            loadTask()
        } catch (error) {
            console.error('Failed to delete subtask:', error)
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setSubmitting(true)
        try {
            await commentsApi.create(id, newComment)
            setNewComment('')
            loadTask()
        } catch (error) {
            console.error('Failed to add comment:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleAddSubtask = async (e) => {
        e.preventDefault()
        if (!newSubtask.trim()) return

        setSubmitting(true)
        try {
            await tasksApi.create({
                title: newSubtask,
                parent_id: id,
                assignee_id: task.assignee?.id // Inherit assignee by default
            })
            setNewSubtask('')
            loadTask()
        } catch (error) {
            console.error('Failed to add subtask:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString('ja-JP', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        )
    }

    if (!task) return null

    return (
        <>
            <div className="page">
                <div className="container">
                    <button className="back-button" onClick={() => navigate('/')}>
                        ← 戻る
                    </button>

                    {/* Task Card */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h1 style={{ fontSize: '24px', fontWeight: '700', flex: 1 }}>{task.title}</h1>
                            <Link
                                to={`/tasks/${id}/edit`}
                                style={{ padding: '8px', fontSize: '20px', textDecoration: 'none' }}
                            >
                                <img src={iconEdit} alt="edit" style={{ width: '24px', height: '24px' }} />
                            </Link>
                        </div>

                        {task.description && (
                            <p style={{ marginTop: '12px', color: 'var(--gray-600)', whiteSpace: 'pre-wrap' }}>
                                {task.description}
                            </p>
                        )}

                        <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {task.category && CATEGORIES[task.category] && (
                                <span className={`category-badge ${CATEGORIES[task.category].className}`}>
                                    {CATEGORIES[task.category].label}
                                </span>
                            )}
                            {task.priority && (
                                <span style={{ fontSize: '14px', color: 'var(--gray-500)' }}>
                                    優先度: {PRIORITIES[task.priority]}
                                </span>
                            )}
                            {task.due_date && (
                                <span style={{ fontSize: '14px', color: 'var(--gray-500)' }}>
                                    📅 {new Date(task.due_date).toLocaleDateString('ja-JP')}
                                </span>
                            )}
                        </div>

                        {task.assignee && (
                            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className={`assignee-dot ${task.assignee.color}`} style={{ width: '12px', height: '12px' }}></span>
                                <span style={{ fontSize: '14px' }}>担当: {task.assignee.name}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <button
                                className={`btn ${task.completed ? 'btn-secondary' : 'btn-primary'}`}
                                onClick={handleComplete}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    backgroundColor: 'white',
                                    color: task.completed ? 'var(--gray-600)' : 'var(--primary-color)',
                                    border: `2px solid ${task.completed ? 'var(--gray-300)' : 'var(--primary-color)'}`
                                }}
                            >
                                <img
                                    src={iconCheck}
                                    alt="check"
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        opacity: task.completed ? 0.5 : 1
                                    }}
                                />
                                {task.completed ? '未完了に戻す' : '完了にする'}
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => setShowDeleteTaskModal(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'white',
                                    border: '2px solid var(--danger-color)'
                                }}
                            >
                                <img
                                    src={iconDelete}
                                    alt="delete"
                                    style={{
                                        width: '18px',
                                        height: '18px'
                                    }}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Subtasks Section */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)',
                                    color: 'white',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px'
                                }}>
                                    <img src={iconSubtask} alt="subtasks" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />
                                </span>
                                サブタスク
                            </h2>
                            {task.subtasks && task.subtasks.length > 0 && (
                                <span style={{
                                    fontSize: '13px',
                                    color: 'var(--gray-500)',
                                    fontWeight: '500'
                                }}>
                                    {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} 完了
                                </span>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {task.subtasks && task.subtasks.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{
                                    height: '8px',
                                    backgroundColor: 'var(--gray-100)',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`,
                                        background: 'linear-gradient(90deg, var(--success-color, #22c55e) 0%, #4ade80 100%)',
                                        borderRadius: '4px',
                                        transition: 'width 0.3s ease'
                                    }}></div>
                                </div>
                            </div>
                        )}

                        {task.subtasks && task.subtasks.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {task.subtasks.map((subtask) => (
                                    <div
                                        key={subtask.id}
                                        style={{
                                            padding: '12px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            backgroundColor: subtask.completed ? 'var(--gray-50)' : 'white',
                                            borderRadius: '10px',
                                            border: '1px solid var(--gray-100)',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {/* Checkbox */}
                                        <div
                                            onClick={async (e) => {
                                                e.stopPropagation()
                                                try {
                                                    await tasksApi.complete(subtask.id, !subtask.completed)
                                                    loadTask()
                                                } catch (error) {
                                                    console.error('Failed to toggle subtask:', error)
                                                }
                                            }}
                                            style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                border: subtask.completed ? 'none' : '2px solid var(--gray-300)',
                                                backgroundColor: subtask.completed ? 'transparent' : 'white',
                                                backgroundImage: subtask.completed ? `url(${iconCheck})` : 'none',
                                                backgroundSize: '100%', // Full size for check
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'center',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                flexShrink: 0
                                            }}
                                        >
                                        </div>

                                        {/* Title - clickable to navigate */}
                                        <div
                                            onClick={() => navigate(`/tasks/${subtask.id}`)}
                                            style={{
                                                flex: 1,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '2px'
                                            }}
                                        >
                                            <span style={{
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                textDecoration: subtask.completed ? 'line-through' : 'none',
                                                color: subtask.completed ? 'var(--gray-400)' : 'var(--text-primary)'
                                            }}>
                                                {subtask.title}
                                            </span>
                                            {subtask.due_date && (
                                                <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                                                    📅 {new Date(subtask.due_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                onClick={() => navigate(`/tasks/${subtask.id}/edit`)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '6px',
                                                    fontSize: '14px',
                                                    opacity: 0.5,
                                                    transition: 'opacity 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.opacity = 1}
                                                onMouseLeave={(e) => e.target.style.opacity = 0.5}
                                            >
                                                <img src={iconEdit} alt="edit" style={{ width: '14px', height: '14px' }} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setDeletingSubtask(subtask)
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '6px',
                                                    fontSize: '14px',
                                                    opacity: 0.5,
                                                    transition: 'opacity 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.opacity = 1}
                                                onMouseLeave={(e) => e.target.style.opacity = 0.5}
                                            >
                                                <img src={iconDelete} alt="delete" style={{ width: '14px', height: '14px' }} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '24px 16px',
                                backgroundColor: 'var(--gray-50)',
                                borderRadius: '10px',
                                border: '2px dashed var(--gray-200)'
                            }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>
                                    ✏️
                                </div>
                                <p style={{ color: 'var(--gray-500)', margin: 0, fontSize: '14px' }}>
                                    サブタスクを追加してタスクを細分化しましょう
                                </p>
                            </div>
                        )}

                        {/* Add Subtask Form */}
                        <form onSubmit={handleAddSubtask} style={{ marginTop: '16px' }}>
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                padding: '8px',
                                backgroundColor: 'var(--gray-50)',
                                borderRadius: '10px',
                                border: '1px solid var(--gray-100)'
                            }}>
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    paddingLeft: '8px',
                                    color: 'var(--gray-400)'
                                }}>
                                    <img src={iconAdd} alt="add" style={{ width: '16px', height: '16px' }} />
                                </span>
                                <input
                                    type="text"
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    placeholder="新しいサブタスクを入力..."
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        background: 'transparent',
                                        fontSize: '14px',
                                        outline: 'none',
                                        padding: '8px 0'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={submitting || !newSubtask.trim()}
                                    style={{
                                        background: newSubtask.trim()
                                            ? 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)'
                                            : '#e5e7eb',
                                        color: newSubtask.trim() ? 'white' : '#6b7280',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '13px',
                                        cursor: newSubtask.trim() ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    追加
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Comments Section */}
                    <div className="card">
                        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={iconComment} alt="comments" style={{ width: '20px', height: '20px' }} />
                            コメント ({task.comments?.length || 0})
                        </h2>

                        {task.comments && task.comments.length > 0 ? (
                            <div>
                                {task.comments.map((comment) => (
                                    <div key={comment.id} className="comment">
                                        <div className={`comment-avatar ${comment.user.color}`}>
                                            {comment.user.name.charAt(0)}
                                        </div>
                                        <div className="comment-content">
                                            <div className="comment-author">{comment.user.name}</div>
                                            <div className="comment-text">{comment.content}</div>
                                            <div className="comment-time">{formatDateTime(comment.created_at)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '16px' }}>
                                まだコメントはありません
                            </p>
                        )}

                        {/* Add Comment Form */}
                        <form onSubmit={handleAddComment} style={{ marginTop: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="コメントを入力..."
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting || !newComment.trim()}
                                >
                                    送信
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div >

            {/* Task Delete Confirmation Modal */}
            < ConfirmModal
                show={showDeleteTaskModal}
                onClose={() => setShowDeleteTaskModal(false)
                }
                onConfirm={handleDelete}
                title="タスク削除の確認"
                message="このタスクを削除しますか？この操作は取り消せません。"
                confirmText="削除する"
                confirmStyle="danger"
            />

            {/* Subtask Delete Confirmation Modal */}
            < ConfirmModal
                show={!!deletingSubtask}
                onClose={() => setDeletingSubtask(null)}
                onConfirm={handleDeleteSubtask}
                title="サブタスク削除の確認"
                message={`「${deletingSubtask?.title}」を削除しますか？`}
                confirmText="削除する"
                confirmStyle="danger"
            />
        </>
    )
}

export default TaskDetailPage
