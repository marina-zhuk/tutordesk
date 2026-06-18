export default function Select({ value, onChange, children, className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${className}`}
    >
      {children}
    </select>
  )
}
