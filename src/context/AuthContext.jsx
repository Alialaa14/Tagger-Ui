import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { refreshAuthFromCookies } from '../socket'

const AuthContext = createContext(null)
const API_BASE = 'http://localhost:3000/api/v1/auth'

function normalizeUserPayload(payload) {
  if (!payload) return null
  if (payload.user && typeof payload.user === 'object') return payload.user
  if (payload.data && typeof payload.data === 'object') {
    if (payload.data.user && typeof payload.data.user === 'object') return payload.data.user
    return payload.data
  }
  if (typeof payload === 'object') return payload
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refreshUser = useCallback(async () => {
    setError(null)
    try {
      const { data: res } = await axios.get(`${API_BASE}/me`, { withCredentials: true })
      const nextUser = normalizeUserPayload(res)
      setUser(nextUser)
      const role = nextUser?.role || nextUser?.accountType || null
      if (role) localStorage.setItem('user_role', String(role).toLowerCase())
      else localStorage.removeItem('user_role')
      return nextUser
    } catch (err) {
      setUser(null)
      setError(err)
      localStorage.removeItem('user_role')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API_BASE}/logout`, {}, { withCredentials: true })
    } catch (_) {
      // ignore logout transport errors and clear local auth anyway
    } finally {
      setUser(null)
      localStorage.removeItem('user_role')
      document.cookie = 'access_token=;path=/;max-age=0;SameSite=Lax'
      try { refreshAuthFromCookies() } catch (_) { /* ignore */ }
    }
  }, [])

  const updateProfile = useCallback(async (payload) => {
    setError(null)
    const { data: res } = await axios.post(`${API_BASE}/me`, payload, { withCredentials: true })
    const nextUser = normalizeUserPayload(res) || normalizeUserPayload(res?.data) || null
    if (nextUser) {
      setUser(nextUser)
      const role = nextUser?.role || nextUser?.accountType || null
      if (role) localStorage.setItem('user_role', String(role).toLowerCase())
    }
    return res
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    refreshUser,
    logout,
    updateProfile,
  }), [user, loading, error, refreshUser, logout, updateProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
