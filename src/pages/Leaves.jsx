import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import api from '../api/client'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/common/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { leaveSchema } from '../schemas/forms'

const Leaves = () => {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState([])
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(leaveSchema), defaultValues: { type: 'Casual' } })
  const isAdmin = user.role === 'admin'

  const load = async () => {
    const { data } = await api.get('/leaves')
    setLeaves(data)
  }

  useEffect(() => { load() }, [])

  const requestLeave = async (values) => {
    await api.post('/leaves', values)
    toast.success('Leave requested')
    reset({ type: 'Casual' })
    load()
  }

  const review = async (id, status) => {
    await api.patch(`/leaves/${id}/review`, { status })
    toast.success(`Leave ${status}`)
    load()
  }

  return (
    <>
      <PageHeader eyebrow="Requests" title="Leave Management" description="Employees can request leave; admins can approve or reject requests." />
      {!isAdmin ? (
        <section className="panel">
          <form onSubmit={handleSubmit(requestLeave)} className="grid gap-4 md:grid-cols-2">
            <label className="form-field"><span>Type</span><select {...register('type')}><option>Casual</option><option>Sick</option><option>Earned</option><option>Unpaid</option></select></label>
            <label className="form-field"><span>From</span><input type="date" {...register('fromDate')} />{errors.fromDate ? <small className="text-rose-300">{errors.fromDate.message}</small> : null}</label>
            <label className="form-field"><span>To</span><input type="date" {...register('toDate')} />{errors.toDate ? <small className="text-rose-300">{errors.toDate.message}</small> : null}</label>
            <label className="form-field"><span>Reason</span><input {...register('reason')} />{errors.reason ? <small className="text-rose-300">{errors.reason.message}</small> : null}</label>
            <button className="rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950">Request Leave</button>
          </form>
        </section>
      ) : null}
      <section className="panel mt-6">
        {!leaves.length ? <EmptyState /> : leaves.map((leave) => (
          <div key={leave._id} className="mb-3 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
            <div><strong>{leave.employee?.name}</strong><p className="text-sm text-gray-400">{leave.reason}</p></div>
            <span>{new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}</span>
            <span className={`status-pill status-${leave.status.toLowerCase()}`}>{leave.status}</span>
            {isAdmin && leave.status === 'Pending' ? <div className="flex gap-2"><button onClick={() => review(leave._id, 'Approved')} className="secondary-button">Approve</button><button onClick={() => review(leave._id, 'Rejected')} className="danger-button">Reject</button></div> : null}
          </div>
        ))}
      </section>
    </>
  )
}

export default Leaves
