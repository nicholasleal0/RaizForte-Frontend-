import React, { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from './ToastContext'

const AuthContext = createContext()

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

  // URL base da API
  const API_BASE = import.meta.env.VITE_API_BASE_URL || (
    import.meta.env.DEV ? 'http://localhost:5001/api' : '/api'
  )

  // Verificar se usuário está logado ao carregar a página
  useEffect(() => {
    checkAuth()
    // checkAuth é estável durante o ciclo de montagem do provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include'
      })
      
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
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        showSuccess('Login realizado com sucesso!')
        return { success: true, user: data.user }
      } else {
        showError(data.error || 'Erro ao fazer login')
        return { success: false, error: data.error }
      }
    } catch {
      showError('Erro de conexão. Tente novamente.')
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        if (data.needs_approval) {
          showSuccess('Cadastro realizado! Aguarde aprovação do administrador.')
        } else {
          showSuccess('Cadastro realizado com sucesso!')
        }
        return { success: true, user: data.user, needsApproval: data.needs_approval }
      } else {
        showError(data.error || 'Erro ao fazer cadastro')
        return { success: false, error: data.error }
      }
    } catch {
      showError('Erro de conexão. Tente novamente.')
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
      showSuccess('Logout realizado com sucesso!')
    } catch {
      showError('Erro ao fazer logout')
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch {
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    checkAuth,
    API_BASE
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

