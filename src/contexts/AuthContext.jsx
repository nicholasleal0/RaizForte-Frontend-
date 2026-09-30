import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useToast } from './ToastContext'

const AuthContext = createContext()
const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showError, showSuccess } = useToast()
  const csrfToken = useRef(null)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || (
    import.meta.env.DEV ? 'http://localhost:5001/api' : '/api'
  )

  const getCsrfToken = async (forceRefresh = false) => {
    if (csrfToken.current && !forceRefresh) return csrfToken.current
    const response = await fetch(`${API_BASE}/security/csrf`, { credentials: 'include' })
    if (!response.ok) throw new Error('Não foi possível preparar a proteção da sessão')
    const data = await response.json()
    csrfToken.current = data.csrf_token
    return csrfToken.current
  }

  const apiFetch = async (url, options = {}) => {
    const method = (options.method || 'GET').toUpperCase()
    const headers = new Headers(options.headers || {})
    if (unsafeMethods.has(method)) {
      headers.set('X-CSRF-Token', await getCsrfToken())
    }
    let response = await fetch(url, { ...options, headers, credentials: 'include' })
    if (response.status === 403 && unsafeMethods.has(method)) {
      const data = await response.clone().json().catch(() => ({}))
      if (data.error?.toLowerCase().includes('csrf')) {
        headers.set('X-CSRF-Token', await getCsrfToken(true))
        response = await fetch(url, { ...options, headers, credentials: 'include' })
      }
    }
    return response
  }

  useEffect(() => {
    checkAuth()
    // checkAuth é estável durante o ciclo de montagem do provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuth = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/auth/me`)
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await apiFetch(`${API_BASE}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      if (response.ok) {
        csrfToken.current = null
        setUser(data.user)
        showSuccess('Login realizado com sucesso!')
        return { success: true, user: data.user }
      }
      showError(data.error || 'Erro ao fazer login')
      return { success: false, error: data.error }
    } catch {
      showError('Erro de conexão. Tente novamente.')
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await apiFetch(`${API_BASE}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      const data = await response.json()
      if (response.ok) {
        csrfToken.current = null
        setUser(data.user)
        if (data.needs_approval) showSuccess('Cadastro realizado! Aguarde aprovação do administrador.')
        else showSuccess('Cadastro realizado com sucesso!')
        return {
          success: true,
          user: data.user,
          needsApproval: data.needs_approval,
          emailVerificationRequired: data.email_verification_required
        }
      }
      showError(data.error || 'Erro ao fazer cadastro')
      return { success: false, error: data.error }
    } catch {
      showError('Erro de conexão. Tente novamente.')
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const verifyEmail = async (code) => {
    try {
      const response = await apiFetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await response.json()
      if (response.ok) {
        setUser(data.user)
        return { success: true, user: data.user }
      }
      return { success: false, error: data.error }
    } catch {
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const resendVerification = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/auth/resend-verification`, { method: 'POST' })
      const data = await response.json()
      return response.ok ? { success: true, developmentCode: data.development_code } : { success: false, error: data.error }
    } catch {
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const logout = async () => {
    try {
      await apiFetch(`${API_BASE}/auth/logout`, { method: 'POST' })
      csrfToken.current = null
      setUser(null)
      showSuccess('Logout realizado com sucesso!')
    } catch {
      showError('Erro ao fazer logout')
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await apiFetch(`${API_BASE}/auth/change-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
      })
      const data = await response.json()
      return response.ok ? { success: true } : { success: false, error: data.error }
    } catch {
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const value = { user, loading, login, register, verifyEmail, resendVerification, logout, changePassword, checkAuth, API_BASE, apiFetch }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
