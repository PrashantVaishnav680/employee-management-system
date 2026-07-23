import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../api/client'
import { AuthContext } from './auth-context'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('ems_user')) || null)
  const [loading, setLoading] = useState(false)

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
    if (!localStorage.getItem('ems_token')) return
    try {
      const { data } = await api.get('/auth/me')
      localStorage.setItem('ems_user', JSON.stringify(data))
      setUser(data)
    } catch {
      localStorage.removeItem('ems_token')
      localStorage.removeItem('ems_user')
      setUser(null)
    }
  }

  useEffect(() => {
    refreshMe()
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout, refreshMe }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
