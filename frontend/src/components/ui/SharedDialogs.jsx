import { useState, useCallback } from 'react'

// Shared Modal Component
export const Modal = ({ show, onClose, title, children }) => {
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
                minWidth: '320px',
                maxWidth: '90%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }} onClick={e => e.stopPropagation()}>
                {title && <h2 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: 'bold' }}>{title}</h2>}
                {children}
            </div>
        </div>
    )
}

// Confirm Modal Component (replacement for native confirm())
export const ConfirmModal = ({
    show,
    onClose,
    onConfirm,
    title = '確認',
    message,
    confirmText = '確認',
    cancelText = 'キャンセル',
    confirmStyle = 'danger', // 'danger' or 'primary'
    loading = false
}) => {
    if (!show) return null

    const confirmButtonStyle = confirmStyle === 'danger'
        ? { background: '#dc2626', color: 'white' }
        : { background: '#2563eb', color: 'white' }

    return (
        <Modal show={show} onClose={onClose} title={title}>
            <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '15px', color: '#374151', margin: 0 }}>
                    {message}
                </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        padding: '10px 20px',
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    {cancelText}
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        ...confirmButtonStyle,
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'wait' : 'pointer',
                        fontWeight: '600',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? '処理中...' : confirmText}
                </button>
            </div>
        </Modal>
    )
}

// Toast Notification Component
export const Toast = ({ show, message, type = 'success' }) => {
    if (!show) return null

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            borderRadius: '8px',
            background: type === 'error' ? '#fef2f2' : '#d1fae5',
            color: type === 'error' ? '#991b1b' : '#065f46',
            border: `1px solid ${type === 'error' ? '#fee2e2' : '#a7f3d0'}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 2000,
            fontWeight: '500',
            fontSize: '14px'
        }}>
            {type === 'error' ? '⚠️ ' : '✓ '}{message}
        </div>
    )
}

// Custom hook for Toast
export const useToast = () => {
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
    }, [])

    return { toast, showToast }
}

// Custom hook for Confirm Modal
export const useConfirm = () => {
    const [confirmState, setConfirmState] = useState({
        show: false,
        title: '確認',
        message: '',
        onConfirm: () => { },
        confirmText: '確認',
        confirmStyle: 'danger',
        loading: false
    })

    const confirm = useCallback(({ title, message, confirmText, confirmStyle = 'danger' }) => {
        return new Promise((resolve) => {
            setConfirmState({
                show: true,
                title,
                message,
                confirmText,
                confirmStyle,
                loading: false,
                onConfirm: () => {
                    setConfirmState(prev => ({ ...prev, show: false }))
                    resolve(true)
                }
            })
        })
    }, [])

    const closeConfirm = useCallback(() => {
        setConfirmState(prev => ({ ...prev, show: false }))
    }, [])

    const setLoading = useCallback((loading) => {
        setConfirmState(prev => ({ ...prev, loading }))
    }, [])

    return { confirmState, confirm, closeConfirm, setLoading }
}
