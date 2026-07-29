import { Navigate, Outlet } from 'react-router-dom'
import Loading from '../common/Loading'
import { useAuth } from '../../hooks/useAuth'

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()

  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />

  return children || <Outlet />
}

export default ProtectedRoute
