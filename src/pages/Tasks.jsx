import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import api from '../api/client'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/common/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { taskSchema } from '../schemas/forms'
import { todayInputValue } from '../utils/date'

const STATUSES = ['New', 'Active', 'Completed', 'Failed']

// Simple confirmation modal
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0d1621] p-6 shadow-2xl">
      <p className="text-base font-semibold">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onCancel} className="secondary-button">Cancel</button>
        <button onClick={onConfirm} className="danger-button">Delete</button>
      </div>
    </div>
  </div>
)

const Tasks = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { register, handleSubmit, reset, formState: { errors, isValid, isSubmitting } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: 'Medium' },
    mode: 'onChange',
  })

  const isAdmin = user.role === 'admin'

  const load = useCallback(async () => {
    try {
      const [{ data: taskData }, employeeResult] = await Promise.all([
        api.get('/tasks', { params: { status, search } }),
        isAdmin ? api.get('/employees') : Promise.resolve({ data: [] }),
      ])
      setTasks(taskData)
      setEmployees(employeeResult.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load tasks')
    }
  }, [isAdmin, search, status])

  useEffect(() => { load() }, [load])

  const createTask = async (values) => {
    try {
      await api.post('/tasks', values)
      toast.success('Task assigned')
      reset({ priority: 'Medium' })
      load()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to assign task')
    }
  }

  const updateTask = async (task, updates) => {
    try {
      await api.patch(`/tasks/${task._id}`, updates)
      toast.success('Task updated')
      load()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task')
    }
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`/tasks/${deleteTarget._id}`)
      toast.success('Task deleted')
      load()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <>
      {deleteTarget && (
        <ConfirmModal
          message={`Delete task "${deleteTarget.title}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <PageHeader eyebrow="Work" title="Task Management" description="Assign, track, search, update progress, and close employee tasks precisely." />

      {isAdmin && (
        <section className="panel">
          <form onSubmit={handleSubmit(createTask)} className="grid gap-4 md:grid-cols-3">
            <label className="form-field">
              <span>Title</span>
              <input {...register('title')} />
              {errors.title && <small className="text-rose-300">{errors.title.message}</small>}
            </label>

            <label className="form-field">
              <span>Due Date</span>
              <input type="date" min={todayInputValue()} {...register('dueDate')} />
              {errors.dueDate && <small className="text-rose-300">{errors.dueDate.message}</small>}
            </label>

            <label className="form-field">
              <span>Assign To</span>
              <select {...register('assignedTo')}>
                <option value="">Select</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
              {errors.assignedTo && <small className="text-rose-300">{errors.assignedTo.message}</small>}
            </label>

            <label className="form-field">
              <span>Category</span>
              <input {...register('category')} />
            </label>

            <label className="form-field">
              <span>Priority</span>
              <select {...register('priority')}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>

            <label className="form-field">
              <span>Estimated Hours</span>
              <input type="number" step="0.5" {...register('estimatedHours')} />
            </label>

            <label className="form-field md:col-span-3">
              <span>Description</span>
              <textarea {...register('description')} className="min-h-24 resize-none" />
              {errors.description && <small className="text-rose-300">{errors.description.message}</small>}
            </label>

            <button
              disabled={!isValid || isSubmitting}
              className="rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </form>
        </section>
      )}

      <section className="panel mt-6">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input
            className="table-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks"
          />
          <select
            className="table-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button onClick={load} className="secondary-button">Apply</button>
        </div>

        {!tasks.length ? (
          <EmptyState title="No Tasks Available" description="New or assigned tasks will appear here." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {tasks.map((task) => (
              <article key={task._id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                      {task.category} / {task.priority}
                    </p>
                    <h3 className="mt-2 text-xl font-black">{task.title}</h3>
                    <p className="mt-2 text-sm text-gray-400">{task.description}</p>
                    <p className="mt-3 text-sm text-gray-300">Assigned: {task.assignedTo?.name}</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setDeleteTarget(task)}
                      className="danger-button h-fit"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <label className="form-field">
                    <span>Status</span>
                    <select
                      className="table-input"
                      value={task.status}
                      onChange={(e) => updateTask(task, { status: e.target.value })}
                    >
                      {STATUSES.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>

                  <label className="form-field">
                    <span>Progress (%)</span>
                    <input
                      className="table-input"
                      type="number"
                      min="0"
                      max="100"
                      value={task.progress}
                      onChange={(e) => updateTask(task, { progress: Number(e.target.value) })}
                    />
                  </label>

                  <label className="form-field">
                    <span>Actual Hours</span>
                    <input
                      className="table-input"
                      type="number"
                      step="0.5"
                      value={task.actualHours}
                      onChange={(e) => updateTask(task, { actualHours: Number(e.target.value) })}
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default Tasks
