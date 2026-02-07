import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (redirect to login)
            if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

// Auth API
export const authApi = {
    signup: (data) => api.post('/signup', data),
    login: (data) => api.post('/login', data),
    logout: () => api.delete('/logout'),
    me: () => api.get('/me')
}

// Couples API
export const couplesApi = {
    join: (inviteCode) => api.post('/couples/join', { invite_code: inviteCode }),
    show: () => api.get('/couple')
}

// Tasks API
export const tasksApi = {
    list: (params) => api.get('/tasks', { params }),
    get: (id) => api.get(`/tasks/${id}`),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.patch(`/tasks/${id}`, data),
    delete: (id) => api.delete(`/tasks/${id}`),
    complete: (id, completed = true) => api.patch(`/tasks/${id}/complete`, { completed })
}

// Comments API
export const commentsApi = {
    list: (taskId) => api.get(`/tasks/${taskId}/comments`),
    create: (taskId, content) => api.post(`/tasks/${taskId}/comments`, { content }),
    delete: (id) => api.delete(`/comments/${id}`)
}

export default api
