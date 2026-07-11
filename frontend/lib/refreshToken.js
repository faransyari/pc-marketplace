import axios from 'axios'
import { API_URL } from './config'

export async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh')
  if (!refresh) return null

  try {
    const response = await axios.post(`${API_URL}/token/refresh/`, {
      refresh: refresh,
    })
    const newAccess = response.data.access
    localStorage.setItem('access', newAccess)
    return newAccess
  } catch (err) {
    console.error('🔒 Failed to refresh token', err)
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    return null
  }
}
