'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from './api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    try {
      const res = await api.get('users/me/')
      setUser(res.data)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null
    if (token) {
      loadMe().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [loadMe])

  const login = useCallback(async (username, password) => {
    const res = await api.post('token/', { username, password })
    localStorage.setItem('access', res.data.access)
    localStorage.setItem('refresh', res.data.refresh)
    await loadMe()
  }, [loadMe])

  const register = useCallback(async (payload) => {
    await api.post('users/', payload)
    await login(payload.username, payload.password)
  }, [login])

  const logout = useCallback(() => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

/** @returns {any} */
export function useAuth() {
  return useContext(AuthContext)
}
