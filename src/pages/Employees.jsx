import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'
import api from '../api/client'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/common/PageHeader'
import { employeeSchema } from '../schemas/forms'

// Minimal schema for the reset-password modal
const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
})

// ---------------------------------------------------------------------------
// ConfirmModal — replaces window.confirm
// ---------------------------------------------------------------------------
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0d1621] p-6 shadow-2xl">
      <p className="text-base font-semibold">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onCancel} className="secondary-button">Cancel</button>
        <button onClick={onConfirm} className="danger-button">Confirm</button>
      </div>
    </div>
  </div>
)

// ---------------------------------------------------------------------------
// ResetPasswordModal — replaces window.prompt
// ---------------------------------------------------------------------------
const ResetPasswordModal = ({ employee, onClose, onReset }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async ({ newPassword }) => {
    await onReset(employee._id, newPassword)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0d1621] p-6 shadow-2xl">
        <h3 className="text-lg font-black">Reset Password</h3>
        <p className="mt-1 text-sm text-gray-400">Set a new temporary password for <strong>{employee.name}</strong>.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4">
          <label className="form-field">
            <span>New Password</span>
            <input type="password" {...register('newPassword')} placeholder="Min 6 characters" />
            {errors.newPassword && <small className="text-rose-300">{errors.newPassword.message}</small>}
          </label>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="secondary-button">Cancel</button>
            <button disabled={isSubmitting} className="rounded-2xl bg-emerald-400 px-5 py-2 font-black text-slate-950 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Set Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Employees Page
// ---------------------------------------------------------------------------
const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [confirmTarget, setConfirmTarget] = useState(null)   // employee to deactivate
  const [resetTarget, setResetTarget] = useState(null)       // employee to reset password

  const { register, handleSubmit, reset, formState: { errors, isValid, isSubmitting } } = useForm({
    resolver: zodResolver(employeeSchema),
    mode: 'onChange',
  })

  const loadEmployees = useCallback(async () => {
    try {
      const { data } = await api.get('/employees', { params: { search } })
      setEmployees(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load employees')
    }
  }, [search])

  useEffect(() => { loadEmployees() }, [loadEmployees])

  const createEmployee = async (values) => {
    try {
      await api.post('/employees', values)
      toast.success('Employee created')
      reset()
      loadEmployees()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create employee')
    }
  }

  const confirmRemove = async () => {
    try {
      await api.delete(`/employees/${confirmTarget._id}`)
      toast.success('Employee deactivated')
      loadEmployees()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate employee')
    } finally {
      setConfirmTarget(null)
    }
  }

  const handleResetPassword = async (employeeId, newPassword) => {
    try {
      await api.patch(`/employees/${employeeId}/reset-password`, { newPassword })
      toast.success('Temporary password set')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password')
    }
  }

  return (
    <>
      {confirmTarget && (
        <ConfirmModal
          message={`Deactivate ${confirmTarget.name}? Historical records will be retained.`}
          onConfirm={confirmRemove}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal
          employee={resetTarget}
          onClose={() => setResetTarget(null)}
          onReset={handleResetPassword}
        />
      )}

      <PageHeader eyebrow="Admin" title="Employee Management" description="Create, search, and manage employee profiles with role-based backend protection." />

      <section className="panel">
        <form onSubmit={handleSubmit(createEmployee)} className="grid gap-4 md:grid-cols-3">
          <label className="form-field">
            <span>Name</span>
            <input {...register('name')} placeholder="Employee Name" />
            {errors.name && <small className="text-rose-300">{errors.name.message}</small>}
          </label>

          <label className="form-field">
            <span>Email</span>
            <input type="email" {...register('email')} placeholder="employee@email.com" />
            {errors.email && <small className="text-rose-300">{errors.email.message}</small>}
          </label>

          <label className="form-field">
            <span>Password</span>
            <input type="password" {...register('password')} placeholder="Temporary Password" />
            {errors.password && <small className="text-rose-300">{errors.password.message}</small>}
          </label>

          <label className="form-field">
            <span>Department</span>
            <select {...register('department')} className="table-input">
              <option value="">Select Department</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Sales</option>
              <option value="QA">QA</option>
              <option value="Operations">Operations</option>
              <option value="Security">Security</option>
            </select>
            {errors.department && <small className="text-rose-300">{errors.department.message}</small>}
          </label>

          <label className="form-field">
            <span>Designation</span>
            <select {...register('designation')} className="table-input">
              <option value="">Select Designation</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="React Developer">React Developer</option>
              <option value="Node.js Developer">Node.js Developer</option>
              <option value="QA Engineer">QA Engineer</option>
              <option value="HR Executive">HR Executive</option>
              <option value="HR Manager">HR Manager</option>
              <option value="Cyber Security Analyst">Cyber Security Analyst</option>
              <option value="SOC Analyst">SOC Analyst</option>
              <option value="Sales Executive">Sales Executive</option>
              <option value="Operations Executive">Operations Executive</option>
            </select>
            {errors.designation && <small className="text-rose-300">{errors.designation.message}</small>}
          </label>

          <label className="form-field">
            <span>Phone</span>
            <input {...register('phone')} placeholder="9876543210" />
            {errors.phone && <small className="text-rose-300">{errors.phone.message}</small>}
          </label>

          <button
            disabled={!isValid || isSubmitting}
            className="self-end rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Employee'}
          </button>
        </form>
      </section>

      <section className="panel mt-6">
        <div className="mb-4 flex gap-3">
          <input
            className="table-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees"
          />
          <button onClick={loadEmployees} className="secondary-button">Search</button>
        </div>

        {!employees.length ? <EmptyState /> : (
          <div className="grid gap-4 lg:grid-cols-2">
            {employees.map((employee) => (
              <article key={employee._id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black">{employee.name}</h3>
                    <p className="text-sm text-emerald-300">{employee.employeeId}</p>
                    <p className="text-sm text-gray-400">{employee.email}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-300">
                      {employee.department} / {employee.designation}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setResetTarget(employee)}
                      className="secondary-button"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => setConfirmTarget(employee)}
                      className="danger-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default Employees
