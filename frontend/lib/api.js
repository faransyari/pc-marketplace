import axios from 'axios'
import { refreshAccessToken } from './refreshToken'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
})

// Attach token to requests
api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses and retry once with refreshed token
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true
      const newAccess = await refreshAccessToken()

      if (newAccess) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return api(originalRequest)
      }
    }

    return Promise.reject(error)
  }
)

export default api
