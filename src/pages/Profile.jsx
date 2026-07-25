import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import api from '../api/client'
import PageHeader from '../components/common/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { passwordSchema } from '../schemas/forms'

const Profile = () => {
  const { user, refreshMe } = useAuth()
  const [sessions, setSessions] = useState([])
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(passwordSchema) })

  const changePassword = async (values) => {
    await api.patch('/auth/change-password', values)
    toast.success('Password changed securely')
    reset()
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await api.patch('/employees/profile', Object.fromEntries(form.entries()))
    toast.success('Profile updated')
    refreshMe()
  }

  useEffect(() => {
    api.get('/auth/sessions').then(({ data }) => setSessions(data)).catch(() => null)
  }, [])

  const signOutEverywhere = async () => {
    try {
      await api.post('/auth/sessions/revoke')
      toast.info('All active sessions have been revoked')
      window.location.assign('/login')
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to revoke sessions') }
  }

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile & Security" description="Update profile details and change password only after verifying the current password." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel">
          <h2 className="section-title">Profile</h2>
          <form onSubmit={updateProfile} className="grid gap-4">
            <label className="form-field"><span>Name</span><input name="name" defaultValue={user.name} /></label>
            <label className="form-field"><span>Phone</span><input name="phone" defaultValue={user.phone} /></label>
            <label className="form-field"><span>Department</span><input name="department" defaultValue={user.department} /></label>
            <label className="form-field"><span>Designation</span><input name="designation" defaultValue={user.designation} /></label>
            <button className="rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950">Save Profile</button>
          </form>
        </section>
        <section className="panel">
          <h2 className="section-title">Change Password</h2>
          <form onSubmit={handleSubmit(changePassword)} className="grid gap-4">
            <label className="form-field"><span>Current Password</span><input type="password" {...register('currentPassword')} />{errors.currentPassword ? <small className="text-rose-300">{errors.currentPassword.message}</small> : null}</label>
            <label className="form-field"><span>New Password</span><input type="password" {...register('newPassword')} />{errors.newPassword ? <small className="text-rose-300">{errors.newPassword.message}</small> : null}</label>
            <button className="rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950">Change Password</button>
          </form>
        </section>
      </div>
      <section className="panel mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="section-title mb-1">Login History</h2><p className="text-sm text-gray-400">Your latest sign-ins and the currently active session.</p></div>
          <button onClick={signOutEverywhere} className="danger-button">Sign out everywhere</button>
        </div>
        <div className="mt-4 space-y-3">
          {!sessions.length ? <p className="text-sm text-gray-400">No login history available yet.</p> : sessions.map((session) => (
            <div key={session._id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm">
              <span className="max-w-full truncate text-gray-300">{session.device}</span>
              <span>{new Date(session.loginAt).toLocaleString()}</span>
              <span className={session.active ? 'text-emerald-300' : 'text-gray-400'}>{session.active ? 'Active now' : `Ended ${session.logoutAt ? new Date(session.logoutAt).toLocaleString() : ''}`}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Profile
