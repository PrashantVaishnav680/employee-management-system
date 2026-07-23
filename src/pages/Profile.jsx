import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import api from '../api/client'
import PageHeader from '../components/common/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { passwordSchema } from '../schemas/forms'

const Profile = () => {
  const { user, refreshMe } = useAuth()
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
    </>
  )
}

export default Profile
