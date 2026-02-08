import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { couplesApi } from '../services/api'

function JoinPage({ user, onJoin }) {
    const [inviteCode, setInviteCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await couplesApi.join(inviteCode)
            await onJoin()
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.error || 'ペアリングに失敗しました')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>パートナーと連携</h1>
                    <p>招待コードを入力してください</p>
                </div>

                {user.partner && (
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <p>すでに {user.partner.name} さんと連携済みです</p>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/')}
                            style={{ marginTop: '16px' }}
                        >
                            タスク一覧へ
                        </button>
                    </div>
                )}

                {!user.partner && (
                    <>
                        {error && <div className="error-message">{error}</div>}

                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <p style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>
                                あなたの招待コード
                            </p>
                            <div className="invite-code">{user.invite_code}</div>
                            <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '8px' }}>
                                パートナーにこのコードを共有してください
                            </p>
                        </div>

                        <div style={{ textAlign: 'center', margin: '24px 0', color: 'var(--gray-400)' }}>
                            または
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">パートナーの招待コード</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    required
                                    maxLength={8}
                                    placeholder="ABCD1234"
                                    style={{ textAlign: 'center', letterSpacing: '0.1em', fontWeight: 'bold' }}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? '連携中...' : 'パートナーと連携'}
                            </button>
                        </form>
                    </>
                )}

                <div className="auth-footer">
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--blue-600)',
                            cursor: 'pointer'
                        }}
                    >
                        タスク一覧に戻る
                    </button>
                </div>
            </div>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <Link to="/" className="nav-item">
                    <span className="nav-icon">📝</span>
                    <span className="nav-label">タスク</span>
                </Link>
                <Link to="/join" className="nav-item active">
                    <span className="nav-icon">👫</span>
                    <span className="nav-label">ペア</span>
                </Link>
                <Link to="/settings" className="nav-item">
                    <span className="nav-icon">⚙️</span>
                    <span className="nav-label">設定</span>
                </Link>
            </nav>
        </div>
    )
}

export default JoinPage
