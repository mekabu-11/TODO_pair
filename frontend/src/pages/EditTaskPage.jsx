import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tasksApi, couplesApi } from '../services/api'

const CATEGORIES = [
    { value: '', label: 'カテゴリを選択' },
    { value: 'money', label: '💰 お金・家計' },
    { value: 'procedure', label: '📋 手続き' },
    { value: 'event', label: '🎉 イベント' },
    { value: 'health', label: '🏥 健康' },
    { value: 'other', label: '📦 その他' }
]

const PRIORITIES = [
    { value: '', label: '優先度を選択' },
    { value: 1, label: '低' },
    { value: 2, label: '中' },
    { value: 3, label: '高' }
]

function EditTaskPage({ user }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [priority, setPriority] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [assigneeId, setAssigneeId] = useState('')
    const [members, setMembers] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        loadData()
    }, [id])

    const loadData = async () => {
        try {
            const [taskRes, coupleRes] = await Promise.all([
                tasksApi.get(id),
                couplesApi.show().catch(() => ({ data: { members: [{ id: user.id, name: user.name, color: user.color }] } }))
            ])

            const task = taskRes.data
            setTitle(task.title)
            setDescription(task.description || '')
            setCategory(task.category || '')
            setPriority(task.priority?.toString() || '')
            setDueDate(task.due_date || '')
            setAssigneeId(task.assignee?.id?.toString() || '')
            setMembers(coupleRes.data.members || [])
        } catch (error) {
            console.error('Failed to load task:', error)
            navigate('/')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            await tasksApi.update(id, {
                title,
                description: description || null,
                category: category || null,
                priority: priority ? parseInt(priority) : null,
                due_date: dueDate || null,
                assignee_id: assigneeId ? parseInt(assigneeId) : null
            })
            navigate(`/tasks/${id}`)
        } catch (err) {
            setError(err.response?.data?.errors?.join(', ') || 'タスクの更新に失敗しました')
        } finally {
            setSubmitting(false)
        }
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
            <div className="container">
                <button className="back-button" onClick={() => navigate(`/tasks/${id}`)}>
                    ← 戻る
                </button>

                <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>
                    タスクを編集
                </h1>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="card">
                        <div className="form-group">
                            <label className="form-label">タイトル *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">詳細</label>
                            <textarea
                                className="form-textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">カテゴリ</label>
                            <select
                                className="form-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">優先度</label>
                            <select
                                className="form-select"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                {PRIORITIES.map((p) => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">期限</label>
                            <input
                                type="date"
                                className="form-input"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">担当者</label>
                            <select
                                className="form-select"
                                value={assigneeId}
                                onChange={(e) => setAssigneeId(e.target.value)}
                            >
                                <option value="">担当者なし</option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                        {submitting ? '保存中...' : '変更を保存'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default EditTaskPage
