import { useMemo, useState } from 'react'
import { useData } from '../context/useData'
import { useConfig } from '../context/useConfig'
import { indexById } from '../lib/selectors'
import { lessonStatusMeta } from '../lib/labels'
import {
  monthGrid,
  startOfToday,
  toISODate,
  parseISODate,
  formatDateHuman,
  formatDateNumeric,
  MONTHS_NOM,
  WEEKDAYS_SHORT,
} from '../lib/date'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Select from '../components/Select'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'

const fieldClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

export default function Lessons() {
  const { students, lessons, addLesson, updateLesson, cancelLesson, markLessonConducted, deleteLesson } = useData()
  const { labels } = useConfig()
  const today = useMemo(() => startOfToday(), [])
  const todayIso = toISODate(today)

  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selectedDay, setSelectedDay] = useState(null)
  const [studentFilter, setStudentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState(null) // { mode, lesson }

  const studentMap = useMemo(() => indexById(students), [students])
  const weeks = useMemo(() => monthGrid(view.year, view.month), [view])

  const monthLessons = useMemo(
    () =>
      lessons.filter((l) => {
        const d = parseISODate(l.date)
        return d.getFullYear() === view.year && d.getMonth() === view.month
      }),
    [lessons, view],
  )

  const byDay = useMemo(() => {
    const m = {}
    for (const l of monthLessons) {
      if (l.status === 'отменено') continue
      m[l.date] = (m[l.date] || 0) + 1
    }
    return m
  }, [monthLessons])

  const list = useMemo(() => {
    let arr = monthLessons
    if (selectedDay) arr = arr.filter((l) => l.date === selectedDay)
    if (studentFilter !== 'all') arr = arr.filter((l) => l.studentId === studentFilter)
    if (statusFilter !== 'all') arr = arr.filter((l) => l.status === statusFilter)
    return [...arr].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  }, [monthLessons, selectedDay, studentFilter, statusFilter])

  const shiftMonth = (delta) => {
    setSelectedDay(null)
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const submitForm = (data) => {
    if (form.mode === 'edit') updateLesson(form.lesson.id, data)
    else addLesson(data)
    setForm(null)
  }

  return (
    <div>
      <PageHeader
        title={labels.sessions}
        subtitle="Календарь и список"
        actions={<Button onClick={() => setForm({ mode: 'add', lesson: null })}>+ Добавить {labels.sessionAcc}</Button>}
      />

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* Календарь */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => shiftMonth(-1)} aria-label="Предыдущий месяц" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <div className="text-sm font-medium text-slate-900">{MONTHS_NOM[view.month]} {view.year}</div>
            <button onClick={() => shiftMonth(1)} aria-label="Следующий месяц" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
            {WEEKDAYS_SHORT.map((d) => (<div key={d} className="py-1">{d}</div>))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {weeks.flat().map((date) => {
              const iso = toISODate(date)
              const inMonth = date.getMonth() === view.month
              const count = byDay[iso] || 0
              const isSelected = selectedDay === iso
              const isToday = iso === todayIso
              return (
                <button
                  key={iso}
                  disabled={!inMonth}
                  onClick={() => setSelectedDay(isSelected ? null : iso)}
                  className={[
                    'relative flex h-10 flex-col items-center justify-center rounded-lg text-sm transition-colors',
                    !inMonth ? 'text-slate-300' : 'text-slate-700 hover:bg-slate-100',
                    isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-600' : '',
                    isToday && !isSelected ? 'ring-1 ring-inset ring-indigo-300' : '',
                  ].join(' ')}
                >
                  <span>{date.getDate()}</span>
                  {count > 0 && inMonth && (
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} />
                  )}
                </button>
              )
            })}
          </div>

          {selectedDay && (
            <button onClick={() => setSelectedDay(null)} className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700">
              Показать весь месяц
            </button>
          )}
        </Card>

        {/* Список */}
        <Card>
          <div className="flex min-w-0 flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="min-w-0 text-sm font-medium text-slate-700">
              {selectedDay ? formatDateHuman(selectedDay) : `${MONTHS_NOM[view.month]} ${view.year}`}
              <span className="ml-2 text-slate-400">{list.length}</span>
            </h2>
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:flex sm:items-center">
              <Select value={studentFilter} onChange={setStudentFilter} className="min-w-0 w-full sm:w-auto">
                <option value="all">{labels.personsAll}</option>
                {students.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </Select>
              <Select value={statusFilter} onChange={setStatusFilter} className="min-w-0 w-full sm:w-auto">
                <option value="all">Все статусы</option>
                <option value="проведено">Проведено</option>
                <option value="запланировано">Запланировано</option>
                <option value="отменено">Отменено</option>
              </Select>
            </div>
          </div>

          {list.length === 0 ? (
            <EmptyState title={`Нет ${labels.sessionsGen}`} hint={selectedDay ? 'В выбранный день записей нет' : 'Измените фильтры или добавьте новую'} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {list.map((l) => {
                const student = studentMap[l.studentId]
                return (
                  <li key={l.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="min-w-0 truncate text-sm font-medium text-slate-900">{student?.name || '—'}</span>
                        <Badge color={lessonStatusMeta[l.status].color}>{lessonStatusMeta[l.status].label}</Badge>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-slate-500">{l.subject} · {l.duration} мин</div>
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 sm:shrink-0 sm:justify-end">
                      <div className="text-sm text-slate-600 sm:text-right">
                        {formatDateNumeric(l.date)}
                        <span className="ml-2 text-slate-400">{l.time}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">
                        {l.status === 'запланировано' && (
                          <IconAction title="Провести" tone="green" onClick={() => markLessonConducted(l.id)}>
                            <path d="M20 6 9 17l-5-5" />
                          </IconAction>
                        )}
                        {l.status !== 'отменено' && (
                          <IconAction title="Отменить" tone="amber" onClick={() => cancelLesson(l.id)}>
                            <circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" />
                          </IconAction>
                        )}
                        <IconAction title="Изменить" tone="slate" onClick={() => setForm({ mode: 'edit', lesson: l })}>
                          <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </IconAction>
                        <IconAction title="Удалить" tone="rose" onClick={() => deleteLesson(l.id)}>
                          <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" />
                        </IconAction>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      <LessonFormModal
        key={form ? `${form.mode}:${form.lesson?.id ?? 'new'}` : 'closed'}
        state={form}
        students={students}
        labels={labels}
        defaultDate={todayIso}
        onClose={() => setForm(null)}
        onSubmit={submitForm}
      />
    </div>
  )
}

function IconAction({ title, onClick, children, tone = 'slate' }) {
  const tones = {
    slate: 'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
    green: 'text-emerald-600 hover:bg-emerald-50',
    amber: 'text-amber-600 hover:bg-amber-50',
    rose: 'text-rose-600 hover:bg-rose-50',
  }
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title} className={`rounded-lg p-1.5 transition-colors ${tones[tone]}`}>
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  )
}

function LessonFormModal({ state, students, labels, defaultDate, onClose, onSubmit }) {
  const isEdit = state?.mode === 'edit'
  const lesson = state?.lesson
  const [form, setForm] = useState(() =>
    isEdit
      ? { studentId: lesson.studentId, date: lesson.date, time: lesson.time, duration: String(lesson.duration) }
      : { studentId: students[0]?.id || '', date: defaultDate, time: '16:00', duration: '60' },
  )

  if (!state) return null
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const canSubmit = form.studentId && form.date

  const submit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    const student = students.find((s) => s.id === form.studentId)
    onSubmit({
      studentId: form.studentId,
      date: form.date,
      time: form.time,
      duration: Number(form.duration),
      subject: student?.subject || '—',
    })
  }

  return (
    <Modal open={!!state} onClose={onClose} title={isEdit ? 'Редактировать' : `Добавить ${labels.sessionAcc}`}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block min-w-0">
          <span className="mb-1 block text-sm font-medium text-slate-600">{labels.person}</span>
          <Select value={form.studentId} onChange={(v) => set('studentId', v)} className="w-full">
            {students.map((s) => (<option key={s.id} value={s.id}>{s.name} · {s.subject}</option>))}
          </Select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Дата</span>
            <input className={fieldClass} type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Время</span>
            <input className={fieldClass} type="time" value={form.time} onChange={(e) => set('time', e.target.value)} />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-600">Длительность</span>
          <Select value={form.duration} onChange={(v) => set('duration', v)} className="w-full">
            <option value="60">60 минут</option>
            <option value="90">90 минут</option>
          </Select>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
          <Button type="submit" disabled={!canSubmit}>{isEdit ? 'Сохранить' : 'Добавить'}</Button>
        </div>
      </form>
    </Modal>
  )
}
