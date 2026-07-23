import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import api from '../api/client'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/common/PageHeader'
import { employeeSchema } from '../schemas/forms'

const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(employeeSchema) })

  const loadEmployees = useCallback(async () => {
    const { data } = await api.get('/employees', { params: { search } })
    setEmployees(data)
  }, [search])

  useEffect(() => { loadEmployees() }, [loadEmployees])

  const createEmployee = async (values) => {
    await api.post('/employees', values)
    toast.success('Employee created')
    reset()
    loadEmployees()
  }

  const removeEmployee = async (id) => {
    if (!confirm('Delete this employee and related records?')) return
    await api.delete(`/employees/${id}`)
    toast.success('Employee deleted')
    loadEmployees()
  }

  const resetPassword = async (employee) => {
    const newPassword = prompt(`Set a temporary password for ${employee.name}. Minimum 6 characters.`)
    if (!newPassword || newPassword.length < 6) return
    await api.patch(`/employees/${employee._id}/reset-password`, { newPassword })
    toast.success('Temporary password set')
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Employee Management" description="Create, search, and manage employee profiles with role-based backend protection." />
      <section className="panel">
        <form
          onSubmit={handleSubmit(createEmployee)}
          className="grid gap-4 md:grid-cols-3"
        >
          {/* Name */}
          <label className="form-field">
            <span>Name</span>
            <input {...register("name")} placeholder="Employee Name" />
            {errors.name && (
              <small className="text-rose-300">{errors.name.message}</small>
            )}
          </label>

          {/* Email */}
          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              {...register("email")}
              placeholder="employee@email.com"
            />
            {errors.email && (
              <small className="text-rose-300">{errors.email.message}</small>
            )}
          </label>

          {/* Password */}
          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              {...register("password")}
              placeholder="Temporary Password"
            />
            {errors.password && (
              <small className="text-rose-300">{errors.password.message}</small>
            )}
          </label>

          {/* Department */}
          <label className="form-field">
            <span>Department</span>

            <select {...register("department")} className="table-input">
              <option value="">Select Department</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Sales</option>
              <option value="QA">QA</option>
              <option value="Operations">Operations</option>
              <option value="Security">Security</option>
            </select>

            {errors.department && (
              <small className="text-rose-300">
                {errors.department.message}
              </small>
            )}
          </label>

          {/* Designation */}
          <label className="form-field">
            <span>Designation</span>

            <select {...register("designation")} className="table-input">
              <option value="">Select Designation</option>

              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="React Developer">React Developer</option>
              <option value="Node.js Developer">Node.js Developer</option>

              <option value="QA Engineer">QA Engineer</option>

              <option value="HR Executive">HR Executive</option>
              <option value="HR Manager">HR Manager</option>

              <option value="Cyber Security Analyst">
                Cyber Security Analyst
              </option>

              <option value="SOC Analyst">SOC Analyst</option>

              <option value="Sales Executive">Sales Executive</option>

              <option value="Operations Executive">
                Operations Executive
              </option>
            </select>

            {errors.designation && (
              <small className="text-rose-300">
                {errors.designation.message}
              </small>
            )}
          </label>

          {/* Phone */}
          <label className="form-field">
            <span>Phone</span>

            <input
              {...register("phone")}
              placeholder="9876543210"
            />

            {errors.phone && (
              <small className="text-rose-300">
                {errors.phone.message}
              </small>
            )}
          </label>

          <button className="self-end rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950">
            Add Employee
          </button>
        </form>
      </section>
      <section className="panel mt-6">
        <div className="mb-4 flex gap-3">
          <input className="table-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees" />
          <button onClick={loadEmployees} className="secondary-button">Search</button>
        </div>
        {!employees.length ? <EmptyState /> : (
          <div className="grid gap-4 lg:grid-cols-2">
            {employees.map((employee) => (
              <article key={employee._id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black">{employee.name}</h3>
                    <p className="text-sm text-emerald-300">
                      {employee.employeeId}
                    </p>
                    <p className="text-sm text-gray-400">{employee.email}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-300">{employee.department} / {employee.designation}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => resetPassword(employee)} className="secondary-button">Reset Password</button>
                    <button onClick={() => removeEmployee(employee._id)} className="danger-button">Delete</button>
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
