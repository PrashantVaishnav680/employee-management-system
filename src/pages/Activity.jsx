import { useEffect, useState } from 'react'
import api from '../api/client'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/common/PageHeader'

const Activity = () => {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    api.get('/activity').then(({ data }) => setLogs(data))
  }, [])

  return (
    <>
      <PageHeader eyebrow="Audit" title="Activity Logs" description="Admin-only audit trail for logins and important CRUD operations." />
      <section className="panel">
        {!logs.length ? <EmptyState /> : logs.map((log) => (
          <div key={log._id} className="mb-3 rounded-2xl border border-white/10 bg-black/20 p-4">
            <strong>{log.action}</strong>
            <p className="text-sm text-gray-400">{log.actor?.name} / {log.entity} / {log.details}</p>
            <p className="mt-1 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </section>
    </>
  )
}

export default Activity
