import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function getRoleFromUser(user) {
  return String(user?.role || user?.accountType || '').toLowerCase()
}

export function RequireAuth() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export function RequireAdmin() {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const role = getRoleFromUser(user) || localStorage.getItem('user_role') || ''
  return role === 'admin' ? <Outlet /> : <Navigate to="/" replace />
}
