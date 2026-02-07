import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

function NewTaskPage({ user }) {
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [priority, setPriority] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [assigneeId, setAssigneeId] = useState('')
    const [members, setMembers] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadMembers()
    }, [])

    const loadMembers = async () => {
        try {
            const response = await couplesApi.show()
            setMembers(response.data.members || [])
        } catch (error) {
            // User might not have a couple yet
            setMembers([{ id: user.id, name: user.name, color: user.color }])
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await tasksApi.create({
                title,
                description: description || null,
                category: category || null,
                priority: priority ? parseInt(priority) : null,
                due_date: dueDate || null,
                assignee_id: assigneeId ? parseInt(assigneeId) : null
            })
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.errors?.join(', ') || 'タスクの作成に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page">
            <div className="container">
                <button className="back-button" onClick={() => navigate('/')}>
                    ← 戻る
                </button>

                <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>
                    新しいタスク
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
                                placeholder="例: 結婚届を提出する"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">詳細</label>
                            <textarea
                                className="form-textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="タスクの詳細を入力..."
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

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? '作成中...' : 'タスクを作成'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default NewTaskPage
