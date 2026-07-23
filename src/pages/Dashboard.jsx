import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api from '../api/client'
import Loading from '../components/common/Loading'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'

const colors = ['#f59e0b', '#38bdf8', '#34d399', '#fb7185']

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    api.get('/analytics').then(({ data }) => setAnalytics(data))
  }, [])

  if (!analytics) return <Loading />

  return (
    <>
      <PageHeader eyebrow="Overview" title="Dashboard Analytics" description="Track workload, progress, attendance, leave volume, and team health from one place." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Employees" value={analytics.totals.employees} tone="amber" />
        <StatCard label="Tasks" value={analytics.totals.tasks} />
        <StatCard label="Leaves" value={analytics.totals.leaves} tone="sky" />
        <StatCard label="Avg Progress" value={`${analytics.totals.averageProgress}%`} tone="rose" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel">
          <h2 className="section-title">Tasks by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={analytics.statusCounts} dataKey="value" nameKey="name" outerRadius={110} label>
                {analytics.statusCounts.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>
        <section className="panel">
          <h2 className="section-title">Attendance Summary</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.attendanceCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="value" fill="#34d399" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </>
  )
}

export default Dashboard
