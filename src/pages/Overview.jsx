import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useData } from '../context/useData'
import { useConfig } from '../context/useConfig'
import {
  computeKpis,
  weeklyRevenue,
  lessonsBySubject,
  upcomingLessons,
  debtSummary,
} from '../lib/selectors'
import { formatCurrency, formatNumber } from '../lib/format'
import { formatDateHuman } from '../lib/date'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'

const ACCENT = '#4f46e5'
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export default function Overview() {
  const { students, lessons } = useData()
  const { labels } = useConfig()

  const kpis = useMemo(() => computeKpis(students, lessons), [students, lessons])
  const revenueData = useMemo(() => weeklyRevenue(lessons, students), [lessons, students])
  const subjectData = useMemo(() => lessonsBySubject(lessons), [lessons])
  const upcoming = useMemo(() => upcomingLessons(lessons, students, 5), [lessons, students])

  const hasRevenue = revenueData.some((d) => d.revenue > 0)

  return (
    <div>
      <PageHeader title="Обзор" subtitle="Ключевые показатели и динамика за месяц" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label={`Всего ${labels.personsGen}`} value={kpis.totalStudents} />
        <StatCard label="Активных" value={kpis.activeStudents} />
        <StatCard label={`${cap(labels.sessionsGen)} за месяц`} value={kpis.lessonsThisMonth} />
        <StatCard label="Выручка за месяц" value={formatCurrency(kpis.revenue)} />
        <StatCard
          label="Посещаемость"
          value={kpis.attendance == null ? '—' : `${kpis.attendance}%`}
          hint="проведено от состоявшихся"
        />
        <DebtorCard students={students} lessons={lessons} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-4 text-sm font-medium text-slate-700">Выручка по неделям</h2>
          {hasRevenue ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 360, height: 288 }}>
                <LineChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} width={64} tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip formatter={(v) => [formatCurrency(v), 'Выручка']} labelFormatter={(l) => `Неделя с ${l}`} />
                  <Line type="monotone" dataKey="revenue" stroke={ACCENT} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Нет данных о выручке" hint="Проведённых занятий за период пока нет" />
          )}
        </Card>

        <Card className="p-4">
          <h2 className="mb-4 text-sm font-medium text-slate-700">{labels.sessions} по {labels.catalogDat}</h2>
          {subjectData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 360, height: 288 }}>
                <BarChart data={subjectData} layout="vertical" margin={{ top: 5, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis type="category" dataKey="subject" width={96} tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => [v, 'Кол-во']} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="count" fill={ACCENT} radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Нет данных" hint="Записей по периодам пока нет" />
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-medium text-slate-700">Ближайшие {labels.sessionsLower.toLowerCase()}</h2>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState title={`Нет запланированных ${labels.sessionsGen}`} hint={`Добавьте на экране «${labels.sessions}»`} />
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcoming.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-900">{l.studentName}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{l.subject} · {l.duration} мин</div>
                </div>
                <div className="shrink-0 text-right text-sm text-slate-600">
                  {formatDateHuman(l.date)}
                  <span className="ml-2 text-slate-400">{l.time}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function DebtorCard({ students, lessons }) {
  const { payments } = useData()
  const debt = useMemo(() => debtSummary(students, lessons, payments), [students, lessons, payments])
  return (
    <Link
      to="/students?debtors=1"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-rose-300 hover:bg-rose-50/40"
    >
      <div className="text-sm text-slate-500">Должники</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{debt.count}</div>
      <div className="mt-1 text-xs text-rose-600">{debt.count > 0 ? formatCurrency(debt.total) : 'нет долгов'}</div>
    </Link>
  )
}
