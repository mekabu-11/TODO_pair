import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'

function SettingsPage({ user, onLogout }) {
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await authApi.logout()
            onLogout()
            navigate('/login')
        } catch (error) {
            console.error('Logout failed:', error)
            // Force logout even if API fails
            onLogout()
            navigate('/login')
        }
    }

    return (
        <div className="page">
            <div className="container">
                <header className="header">
                    <h1 className="header-title">設定</h1>
                </header>

                {/* Profile Section */}
                <div className="settings-section">
                    <div className="settings-section-title">プロフィール</div>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    background: user.color === 'blue' ? 'var(--blue-500)' : 'var(--green-500)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '24px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: '600' }}>{user.name}</div>
                                <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>{user.email}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Couple Section */}
                <div className="settings-section">
                    <div className="settings-section-title">パートナー連携</div>
                    <div className="card">
                        {user.partner ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: user.partner.color === 'blue' ? 'var(--blue-500)' : 'var(--green-500)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '20px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {user.partner.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{user.partner.name}</div>
                                    <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>連携済み ✓</div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ marginBottom: '16px', color: 'var(--gray-600)' }}>
                                    パートナーとまだ連携していません
                                </p>
                                <div style={{ marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>あなたの招待コード</span>
                                </div>
                                <div className="invite-code">{user.invite_code}</div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/join')}
                                    style={{ marginTop: '16px' }}
                                >
                                    パートナーと連携
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* App Info */}
                <div className="settings-section">
                    <div className="settings-section-title">アプリ情報</div>
                    <div className="settings-item">
                        <span>バージョン</span>
                        <span style={{ color: 'var(--gray-500)' }}>1.0.0</span>
                    </div>
                </div>

                {/* Logout */}
                <button
                    className="btn btn-danger btn-full"
                    onClick={handleLogout}
                    style={{ marginTop: '24px' }}
                >
                    ログアウト
                </button>
            </div>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <a href="/" className="nav-item">
                    <span className="nav-item-icon">📋</span>
                    タスク
                </a>
                <a href="/join" className="nav-item">
                    <span className="nav-item-icon">👫</span>
                    ペア
                </a>
                <a href="/settings" className="nav-item active">
                    <span className="nav-item-icon">⚙️</span>
                    設定
                </a>
            </nav>
        </div>
    )
}

export default SettingsPage
