import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'

function LoginPage({ onLogin }) {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        console.log('Login attempt starting...')
        try {
            const { data } = await authApi.login({ email, password })
            console.log('Login API success:', data)

            // Explicitly set user and navigate (Fixing the hang issue)
            if (data?.user) {
                console.log('Explicitly setting user and navigating')
                onLogin(data.user)
                navigate('/')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError(err.response?.data?.error || 'ログインに失敗しました')
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>ふたりのTODO</h1>
                    <p>パートナーと一緒にタスク管理</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">メールアドレス</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="email@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">パスワード</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'ログイン中...' : 'ログイン'}
                    </button>
                </form>

                <div className="auth-footer">
                    {/* アカウントをお持ちでない方は <Link to="/signup">新規登録</Link> */}
                    <span style={{ fontSize: '0.9em', color: '#666' }}>※新規登録は管理者にお問い合わせください</span>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
