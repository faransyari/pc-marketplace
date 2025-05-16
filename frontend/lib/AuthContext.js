import { createContext, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('access')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUser({ username: decoded.username, id: decoded.user_id })
      } catch {
        setUser(null)
      }
    }
  }, [])

  const login = (token) => {
    localStorage.setItem('access', token.access)
    localStorage.setItem('refresh', token.refresh)
    const decoded = jwtDecode(token.access)
    setUser({ username: decoded.username, id: decoded.user_id })
  }

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

