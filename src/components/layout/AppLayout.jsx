import { Bell, CalendarCheck, ClipboardList, LayoutDashboard, LogOut, Menu, UserRound, UsersRound, Workflow } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', icon: UsersRound, adminOnly: true },
  { to: '/tasks', label: 'Tasks', icon: ClipboardList },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/leaves', label: 'Leaves', icon: Workflow },
  { to: '/activity', label: 'Activity', icon: Bell, adminOnly: true },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

const AppLayout = () => {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const visibleItems = navItems.filter((item) => !item.adminOnly || user.role === 'admin')

  return (
    <div className="min-h-screen bg-[#081018] text-white">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-[#0d1621]/95 p-5 backdrop-blur transition md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-300">EMS</p>
            <h1 className="mt-2 text-2xl font-black">WorkPulse</h1>
            <p className="mt-1 text-xs text-gray-400">Created by Prashant Vaishnav</p>
          </div>
          <button className="md:hidden" onClick={() => setOpen(false)}>Close</button>
        </div>
        <nav className="mt-8 grid gap-2">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${isActive ? 'bg-emerald-400 text-slate-950' : 'text-gray-300 hover:bg-white/10'}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#081018]/80 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex items-center justify-between">
            <button className="rounded-xl bg-white/10 p-3 md:hidden" onClick={() => setOpen(true)}><Menu size={18} /></button>
            <div>
              <p className="text-sm text-gray-400">Signed in as</p>
              <h2 className="font-bold">{user.name} <span className="text-emerald-300">({user.role})</span></h2>
            </div>
            <button onClick={logout} className="flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold transition hover:bg-rose-400">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>
        <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="p-4 md:p-8">
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}

export default AppLayout
