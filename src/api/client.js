import axios from 'axios'

// Axios instance — withCredentials ensures the HttpOnly auth cookie is
// automatically sent on every request. No token is ever stored in localStorage.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
})

// On 401 responses (expired/missing session) redirect to login,
// but skip the redirect for the login request itself.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return Promise.reject(error)
  }
)

export default api
