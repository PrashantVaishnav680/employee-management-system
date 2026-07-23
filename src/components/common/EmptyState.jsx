const EmptyState = ({ title = 'No records found', description = 'Try changing filters or create a new record.' }) => (
  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="mt-2 text-sm text-gray-400">{description}</p>
  </div>
)

export default EmptyState
