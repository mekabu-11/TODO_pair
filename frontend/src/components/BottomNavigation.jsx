import { Link, useLocation } from 'react-router-dom'

function BottomNavigation() {
    const location = useLocation()
    const isActive = (path) => location.pathname === path

    return (
        <nav className="bottom-nav">
            <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                <span className="nav-icon">📝</span>
                <span className="nav-label">タスク</span>
            </Link>
            <Link to="/join" className={`nav-item ${isActive('/join') ? 'active' : ''}`}>
                <span className="nav-icon">👫</span>
                <span className="nav-label">ペア</span>
            </Link>
            <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
                <span className="nav-icon">⚙️</span>
                <span className="nav-label">設定</span>
            </Link>
        </nav>
    )
}

export default BottomNavigation
