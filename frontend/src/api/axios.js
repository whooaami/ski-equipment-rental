import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8001'
})

// Request interceptor - додає токен
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - обробляє 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register'
      if (!isAuthPage) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
