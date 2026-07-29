import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { loginSchema } from '../schemas/forms'
import { useAuth } from '../hooks/useAuth'

const Login = () => {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    // defaultValues: { email: 'Admin@ems.com', password: 'Admin@123' },
  })

  const onSubmit = async (values) => {
    if (await login(values)) navigate('/')
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#065f46,#111827_42%,#05070a)] px-4 py-8 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-10 lg:grid-cols-[1fr_0.85fr]">
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 lg:pr-8">
          <div>
            <h1 className="text-5xl font-black leading-tight md:text-7xl">WorkPulse</h1>
            <p className="mt-5 max-w-xl text-lg text-gray-300">A full-stack employee management platform with secure auth, analytics, tasks, attendance, leaves, logs, and role-based access.</p>
          </div>
          <p className="text-sm text-gray-400">Created by <span className="font-bold text-white">Prashant Vaishnav</span></p>
        </motion.section>

        <motion.form initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <h2 className="text-3xl font-black text-center">Login</h2>
          {/* <p className="mt-2 text-sm text-gray-400">Seed credentials: admin@ems.com / Admin@123</p> */}
          <label className="form-field mt-8">
            <span>Email</span>
            <input {...register('email')} placeholder="email@example.com" />
            {errors.email ? <small className="text-rose-300">{errors.email.message}</small> : null}
          </label>
          <label className="form-field mt-4">
            <span>Password</span>
            <input {...register('password')} type="password" placeholder="Password" />
            {errors.password ? <small className="text-rose-300">{errors.password.message}</small> : null}
          </label>
          <button disabled={loading} className="mt-6 w-full rounded-2xl bg-emerald-400 px-5 py-4 font-black text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="mt-4 text-xs text-gray-400">Forgot password? Login first and use Profile to change your password. Real reset links require email or OTP backend integration.</p>
        </motion.form>
      </div>
    </main>
  )
}

export default Login
