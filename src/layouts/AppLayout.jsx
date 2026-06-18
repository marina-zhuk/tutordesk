import { NavLink, Outlet } from 'react-router-dom'
import { useConfig } from '../context/useConfig'

const linkClass = ({ isActive }) =>
  [
    'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')

const mobileLinkClass = ({ isActive }) =>
  [
    'shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')

function ResetButton({ onReset, className = '' }) {
  return (
    <button
      onClick={onReset}
      title="Вернуть демо к исходным данным"
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 ${className}`}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
      </svg>
      Сбросить демо
    </button>
  )
}

function AppLayout() {
  const { appName, labels, resetData } = useConfig()
  const navItems = [
    { to: '/', label: 'Обзор' },
    { to: '/students', label: labels.persons },
    { to: '/lessons', label: labels.sessions },
    { to: '/settings', label: 'Настройки' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      {/* Десктоп: боковое меню */}
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className="mb-6 truncate px-2 text-lg font-semibold text-slate-900">{appName}</div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <ResetButton onReset={resetData} className="mt-auto" />
      </aside>

      {/* Мобайл: верхняя горизонтальная полоса */}
      <header className="border-b border-slate-200 bg-white md:hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="truncate text-lg font-semibold text-slate-900">{appName}</div>
          <ResetButton onReset={resetData} className="shrink-0 !px-2 !py-1 !text-xs" />
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={mobileLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AppLayout
