import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../api/client'
import { AuthContext } from './auth-context'

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('ems_user')
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    localStorage.removeItem('ems_user')
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser)
  const [loading, setLoading] = useState(true)

  const login = async (values) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', values)
      localStorage.setItem('ems_token', data.token)
      localStorage.setItem('ems_user', JSON.stringify(data.user))
      setUser(data.user)
      toast.success(`Welcome ${data.user.name}`)
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await api.post('/auth/logout').catch(() => null)
    localStorage.removeItem('ems_token')
    localStorage.removeItem('ems_user')
    setUser(null)
    toast.info('Logged out')
  }

  const refreshMe = async () => {
    if (!localStorage.getItem('ems_token')) {
      setLoading(false)
      return
    }
    try {
      const { data } = await api.get('/auth/me')
      localStorage.setItem('ems_user', JSON.stringify(data))
      setUser(data)
    } catch {
      localStorage.removeItem('ems_token')
      localStorage.removeItem('ems_user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshMe()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('ems_token')
    if (!token) return undefined
    try {
      const [, payload] = token.split('.')
      const { exp } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
      const remaining = exp * 1000 - Date.now()
      if (remaining <= 0) {
        localStorage.removeItem('ems_token'); localStorage.removeItem('ems_user'); setUser(null)
        return undefined
      }
      const timeout = setTimeout(() => {
        localStorage.removeItem('ems_token'); localStorage.removeItem('ems_user'); setUser(null)
        window.location.assign('/login')
      }, remaining)
      return () => clearTimeout(timeout)
    } catch { return undefined }
  }, [user])

  const value = useMemo(() => ({ user, loading, login, logout, refreshMe }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
