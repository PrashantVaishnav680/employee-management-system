const PageHeader = ({ eyebrow, title, description, children }) => (
  <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/20 md:flex-row md:items-end md:justify-between">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-emerald-300">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-black md:text-5xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-400">{description}</p>
    </div>
    {children}
  </div>
)

export default PageHeader
