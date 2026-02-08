import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../services/api'

function SignupPage({ onSignup }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== passwordConfirmation) {
            setError('パスワードが一致しません')
            return
        }

        setLoading(true)

        try {
            await authApi.signup({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation
            })
            // Note: User state is set by onAuthStateChange in App.jsx
            // No need to call onSignup here
        } catch (err) {
            setError(err.response?.data?.errors?.join(', ') || '登録に失敗しました')
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>ふたりのTODO</h1>
                    <p>新規アカウント登録</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">お名前</label>
                        <input
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="太郎"
                        />
                    </div>

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
                            minLength={6}
                            placeholder="6文字以上"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">パスワード（確認）</label>
                        <input
                            type="password"
                            className="form-input"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            placeholder="もう一度入力"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? '登録中...' : 'アカウント作成'}
                    </button>
                </form>

                <div className="auth-footer">
                    すでにアカウントをお持ちの方は
                    <Link to="/login">ログイン</Link>
                </div>
            </div>
        </div>
    )
}

export default SignupPage
