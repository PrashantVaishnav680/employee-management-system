import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../api/client'
import { AuthContext } from './auth-context'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch the current user from the server using the HttpOnly cookie.
  // This is the ONLY way to check auth state — no localStorage involved.
  const refreshMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Check session on mount
  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  const login = async (values) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', values)
      // Backend sets the HttpOnly cookie — we only receive the user object.
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
    setUser(null)
    toast.info('Logged out')
  }

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshMe }),
    [user, loading, refreshMe]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
