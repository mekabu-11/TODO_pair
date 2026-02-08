import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../services/api'

// Modal component - defined outside to prevent re-creation on render
const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                minWidth: '400px',
                maxWidth: '90%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }} onClick={e => e.stopPropagation()}>
                <h2 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: 'bold' }}>{title}</h2>
                {children}
            </div>
        </div>
    )
}

// FormInput component - defined outside to prevent focus loss
const FormInput = ({ label, type = 'text', value, onChange, placeholder, required = false }) => (
    <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
            }}
        />
    </div>
)

function AdminDashboardPage({ user }) {
    const [stats, setStats] = useState({ users: 0, tasks: 0 })
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Toast notification state
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [deletingUser, setDeletingUser] = useState(null)

    // Form states
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'user'
    })
    const [submitting, setSubmitting] = useState(false)

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            setError(null)

            if (!adminApi.isAvailable()) {
                setError('Service Role Keyが設定されていません。.envにVITE_SUPABASE_SERVICE_KEYを追加してください。')
                return
            }

            const { data } = await adminApi.listUsers()
            setUsers(data || [])
            setStats(prev => ({ ...prev, users: data?.length || 0 }))
        } catch (err) {
            console.error('Error fetching users:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateUser = async (e) => {
        e.preventDefault()
        if (!formData.email || !formData.password || !formData.name) {
            showToast('全ての項目を入力してください', 'error')
            return
        }

        setSubmitting(true)
        try {
            await adminApi.createUser(formData)
            setShowCreateModal(false)
            setFormData({ email: '', password: '', name: '', role: 'user' })
            fetchUsers()
            showToast('ユーザーを作成しました')
        } catch (err) {
            showToast('エラー: ' + err.message, 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEditUser = async (e) => {
        e.preventDefault()
        if (!editingUser) return

        setSubmitting(true)
        try {
            const updates = {}
            if (formData.name && formData.name !== editingUser.name) updates.name = formData.name
            if (formData.email && formData.email !== editingUser.email) updates.email = formData.email
            if (formData.password) updates.password = formData.password
            if (formData.role !== editingUser.role) updates.role = formData.role

            if (Object.keys(updates).length === 0) {
                setShowEditModal(false)
                return
            }

            await adminApi.updateUser(editingUser.id, updates)
            setShowEditModal(false)
            setEditingUser(null)
            setFormData({ email: '', password: '', name: '', role: 'user' })
            fetchUsers()
            showToast('ユーザーを更新しました')
        } catch (err) {
            showToast('エラー: ' + err.message, 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const openDeleteModal = (targetUser) => {
        if (targetUser.id === user?.id) {
            showToast('自分自身は削除できません', 'error')
            return
        }
        setDeletingUser(targetUser)
        setShowDeleteModal(true)
    }

    const handleDeleteUser = async () => {
        if (!deletingUser) return

        setSubmitting(true)
        try {
            await adminApi.deleteUser(deletingUser.id)
            setShowDeleteModal(false)
            setDeletingUser(null)
            fetchUsers()
            showToast('ユーザーを削除しました')
        } catch (err) {
            showToast('エラー: ' + err.message, 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const openEditModal = (targetUser) => {
        setEditingUser(targetUser)
        setFormData({
            email: targetUser.email,
            name: targetUser.name,
            password: '',
            role: targetUser.role || 'user'
        })
        setShowEditModal(true)
    }

    return (
        <div className="page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Toast Notification */}
            {toast.show && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    background: toast.type === 'error' ? '#fef2f2' : '#d1fae5',
                    color: toast.type === 'error' ? '#991b1b' : '#065f46',
                    border: `1px solid ${toast.type === 'error' ? '#fee2e2' : '#a7f3d0'}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 2000,
                    fontWeight: '500',
                    fontSize: '14px'
                }}>
                    {toast.type === 'error' ? '⚠️ ' : '✓ '}{toast.message}
                </div>
            )}
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>👤 管理画面</h1>
                <Link to="/" style={{
                    padding: '8px 16px',
                    background: 'var(--gray-100)',
                    borderRadius: '8px',
                    color: 'var(--gray-700)',
                    textDecoration: 'none',
                    fontSize: '14px'
                }}>← タスク一覧へ戻る</Link>
            </header>

            {error && (
                <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    color: '#991b1b',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    ⚠️ {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>総ユーザー数</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{stats.users}</p>
                </div>
            </div>

            <section style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>ユーザー一覧</h2>
                    <button
                        onClick={() => {
                            setFormData({ email: '', password: '', name: '', role: 'user' })
                            setShowCreateModal(true)
                        }}
                        style={{
                            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}
                    >
                        + 新規ユーザー
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>読み込み中...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                                    <th style={{ padding: '12px' }}>名前</th>
                                    <th style={{ padding: '12px' }}>メールアドレス</th>
                                    <th style={{ padding: '12px' }}>権限</th>
                                    <th style={{ padding: '12px' }}>登録日</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                                            ユーザーが見つかりません
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '12px', fontWeight: '500' }}>{u.name}</td>
                                            <td style={{ padding: '12px', color: '#6b7280' }}>{u.email}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '9999px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    background: u.role === 'admin' ? '#fef2f2' : '#d1fae5',
                                                    color: u.role === 'admin' ? '#991b1b' : '#065f46'
                                                }}>
                                                    {u.role || 'user'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', color: '#6b7280' }}>
                                                {new Date(u.created_at).toLocaleDateString('ja-JP')}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => openEditModal(u)}
                                                    style={{
                                                        background: '#eff6ff',
                                                        color: '#2563eb',
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        marginRight: '8px',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    編集
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(u)}
                                                    disabled={u.id === user?.id}
                                                    style={{
                                                        background: u.id === user?.id ? '#f3f4f6' : '#fef2f2',
                                                        color: u.id === user?.id ? '#9ca3af' : '#dc2626',
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        cursor: u.id === user?.id ? 'not-allowed' : 'pointer',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    削除
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Create User Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} title="新規ユーザー作成">
                <form onSubmit={handleCreateUser}>
                    <FormInput
                        label="名前"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="山田 太郎"
                        required
                    />
                    <FormInput
                        label="メールアドレス"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="user@example.com"
                        required
                    />
                    <FormInput
                        label="パスワード"
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        placeholder="8文字以上"
                        required
                    />
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>権限</label>
                        <select
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="user">一般ユーザー</option>
                            <option value="admin">管理者</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            style={{
                                padding: '10px 20px',
                                background: '#f3f4f6',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                padding: '10px 20px',
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            {submitting ? '作成中...' : '作成'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit User Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title="ユーザー編集">
                <form onSubmit={handleEditUser}>
                    <FormInput
                        label="名前"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="山田 太郎"
                    />
                    <FormInput
                        label="メールアドレス"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="user@example.com"
                    />
                    <FormInput
                        label="新しいパスワード（変更する場合のみ）"
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        placeholder="空欄の場合は変更なし"
                    />
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>権限</label>
                        <select
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="user">一般ユーザー</option>
                            <option value="admin">管理者</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                        <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            style={{
                                padding: '10px 20px',
                                background: '#f3f4f6',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                padding: '10px 20px',
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            {submitting ? '更新中...' : '更新'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setDeletingUser(null); }}
                title="ユーザー削除の確認"
            >
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '15px', color: '#374151', margin: 0 }}>
                        「<strong>{deletingUser?.name}</strong>」を削除しますか？
                    </p>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
                        この操作は取り消せません。
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => { setShowDeleteModal(false); setDeletingUser(null); }}
                        style={{
                            padding: '10px 20px',
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleDeleteUser}
                        disabled={submitting}
                        style={{
                            padding: '10px 20px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        {submitting ? '削除中...' : '削除する'}
                    </button>
                </div>
            </Modal>
        </div>
    )
}

export default AdminDashboardPage
