const StatCard = ({ label, value, tone = 'emerald' }) => {
  const tones = {
    emerald: 'border-emerald-400/30 text-emerald-300',
    sky: 'border-sky-400/30 text-sky-300',
    amber: 'border-amber-400/30 text-amber-300',
    rose: 'border-rose-400/30 text-rose-300',
  }

  return (
    <div className={`rounded-3xl border bg-white/[0.06] p-5 shadow-xl shadow-black/20 ${tones[tone]}`}>
      <p className="text-sm text-gray-400">{label}</p>
      <h2 className="mt-2 text-4xl font-black">{value}</h2>
    </div>
  )
}

export default StatCard
