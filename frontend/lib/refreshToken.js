import axios from 'axios'

export async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh')
  if (!refresh) return null

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
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
