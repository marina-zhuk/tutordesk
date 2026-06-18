import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../context/useData'
import { useConfig } from '../context/useConfig'
import { studentStats } from '../lib/selectors'
import { studentStatusMeta, lessonStatusMeta } from '../lib/labels'
import { formatCurrency } from '../lib/format'
import { formatDateNumeric } from '../lib/date'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import SearchInput from '../components/SearchInput'
import Select from '../components/Select'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'

const fieldClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

export default function Students() {
  const { students, lessons, payments, addStudent, updateStudent, deleteStudent } = useData()
  const { labels, services } = useConfig()
  const [params] = useSearchParams()

  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('all')
  const [status, setStatus] = useState('all')
  const [onlyDebtors, setOnlyDebtors] = useState(params.get('debtors') === '1')

  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(null) // { mode, student }
  const [deleteTarget, setDeleteTarget] = useState(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return students
      .map((student) => ({ student, stats: studentStats(student, lessons, payments) }))
      .filter(({ student, stats }) => {
        if (q && !student.name.toLowerCase().includes(q)) return false
        if (subject !== 'all' && student.subject !== subject) return false
        if (status !== 'all' && student.status !== status) return false
        if (onlyDebtors && stats.balance >= 0) return false
        return true
      })
  }, [students, lessons, payments, query, subject, status, onlyDebtors])

  const selected = selectedId ? students.find((s) => s.id === selectedId) : null

  const openEdit = (student) => {
    setSelectedId(null)
    setForm({ mode: 'edit', student })
  }
  const submitForm = (data) => {
    if (form.mode === 'edit') updateStudent(form.student.id, data)
    else addStudent(data)
    setForm(null)
  }
  const confirmDelete = () => {
    deleteStudent(deleteTarget.id)
    setDeleteTarget(null)
    setSelectedId(null)
  }

  return (
    <div>
      <PageHeader
        title={labels.persons}
        subtitle={`Всего: ${students.length}`}
        actions={<Button onClick={() => setForm({ mode: 'add', student: null })}>+ Добавить {labels.personAcc}</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="sm:max-w-xs sm:flex-1">
          <SearchInput value={query} onChange={setQuery} placeholder={labels.searchByName} />
        </div>
        <Select value={subject} onChange={setSubject}>
          <option value="all">{labels.catalogAll}</option>
          {services.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Select value={status} onChange={setStatus}>
          <option value="all">Все статусы</option>
          <option value="активный">Активные</option>
          <option value="на паузе">На паузе</option>
        </Select>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={onlyDebtors} onChange={(e) => setOnlyDebtors(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30" />
          Только должники
        </label>
      </div>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState title={`${labels.persons} не найдены`} hint="Измените условия поиска или фильтры" />
        ) : (
          <>
            {/* Десктоп: таблица */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Имя</th>
                    <th className="px-4 py-3 font-medium">{labels.catalog}</th>
                    <th className="px-4 py-3 font-medium">{labels.level}</th>
                    <th className="px-4 py-3 font-medium">Телефон</th>
                    <th className="px-4 py-3 text-right font-medium">Проведено</th>
                    <th className="px-4 py-3 text-right font-medium">Баланс</th>
                    <th className="px-4 py-3 font-medium">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map(({ student, stats }) => (
                    <tr key={student.id} onClick={() => setSelectedId(student.id)} className="cursor-pointer transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{student.name}</td>
                      <td className="px-4 py-3 text-slate-600">{student.subject}</td>
                      <td className="px-4 py-3 text-slate-600">{student.level}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{student.phone}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{stats.conductedCount}</td>
                      <td className={`px-4 py-3 text-right font-medium ${stats.balance < 0 ? 'text-rose-600' : 'text-slate-700'}`}>{formatCurrency(stats.balance)}</td>
                      <td className="px-4 py-3">
                        <Badge color={studentStatusMeta[student.status].color}>{studentStatusMeta[student.status].label}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Мобайл: карточки */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {rows.map(({ student, stats }) => (
                <li key={student.id} onClick={() => setSelectedId(student.id)} className="cursor-pointer px-4 py-3 active:bg-slate-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-900">{student.name}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-500">{student.subject} · {student.level}</div>
                      <div className="mt-1 text-xs text-slate-500">{student.phone}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge color={studentStatusMeta[student.status].color}>{studentStatusMeta[student.status].label}</Badge>
                      <div className={`mt-1 text-sm font-medium ${stats.balance < 0 ? 'text-rose-600' : 'text-slate-700'}`}>{formatCurrency(stats.balance)}</div>
                      <div className="text-xs text-slate-400">{stats.conductedCount} зан.</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <StudentDetail
        student={selected}
        lessons={lessons}
        payments={payments}
        labels={labels}
        onClose={() => setSelectedId(null)}
        onEdit={openEdit}
        onDelete={(s) => setDeleteTarget(s)}
      />
      <StudentFormModal
        key={form ? `${form.mode}:${form.student?.id ?? 'new'}` : 'closed'}
        state={form}
        labels={labels}
        services={services}
        onClose={() => setForm(null)}
        onSubmit={submitForm}
      />
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={`Удалить ${labels.personAcc}?`}>
        <p className="text-sm text-slate-600">
          {deleteTarget?.name} и связанные {labels.sessionsGen}/оплаты будут удалены из демо. Действие необратимо.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Отмена</Button>
          <Button variant="danger" onClick={confirmDelete}>Удалить</Button>
        </div>
      </Modal>
    </div>
  )
}

function StudentDetail({ student, lessons, payments, labels, onClose, onEdit, onDelete }) {
  const stats = useMemo(
    () => (student ? studentStats(student, lessons, payments) : null),
    [student, lessons, payments],
  )
  if (!student) return null

  const history = [...stats.lessons].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
  const pays = payments.filter((p) => p.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Modal open={!!student} onClose={onClose} title={student.name}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={studentStatusMeta[student.status].color}>{studentStatusMeta[student.status].label}</Badge>
          <Badge color="slate">{student.subject}</Badge>
          <Badge color="slate">{student.level}</Badge>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="min-w-0">
            <dt className="text-slate-500">Телефон</dt>
            <dd className="truncate text-slate-900">{student.phone}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{labels.rate}</dt>
            <dd className="text-slate-900">{formatCurrency(student.rate)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Проведено {labels.sessionsGen}</dt>
            <dd className="text-slate-900">{stats.conductedCount}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Баланс</dt>
            <dd className={stats.balance < 0 ? 'font-medium text-rose-600' : 'font-medium text-slate-900'}>{formatCurrency(stats.balance)}</dd>
          </div>
        </dl>

        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-700">История {labels.sessionsGen}</h3>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">Пока нет</p>
          ) : (
            <ul className="max-h-44 space-y-1 overflow-y-auto pr-1">
              {history.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">{formatDateNumeric(l.date)} · {l.time}</span>
                  <Badge color={lessonStatusMeta[l.status].color}>{lessonStatusMeta[l.status].label}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-700">История оплат</h3>
          {pays.length === 0 ? (
            <p className="text-sm text-slate-400">Оплат пока нет</p>
          ) : (
            <ul className="space-y-1">
              {pays.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">{formatDateNumeric(p.date)} · {p.method}</span>
                  <span className="font-medium text-emerald-700">+{formatCurrency(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="danger" onClick={() => onDelete(student)}>Удалить</Button>
          <Button variant="secondary" onClick={() => onEdit(student)}>Редактировать</Button>
        </div>
      </div>
    </Modal>
  )
}

// Монтируется заново на каждое открытие (key в родителе), поэтому состояние формы
// инициализируется напрямую из props: add → пусто, edit → данные ученика.
function StudentFormModal({ state, labels, services, onClose, onSubmit }) {
  const isEdit = state?.mode === 'edit'
  const initial = state?.student
  const [form, setForm] = useState(() =>
    isEdit
      ? { name: initial.name, subject: initial.subject, level: initial.level, phone: initial.phone, rate: String(initial.rate), status: initial.status }
      : { name: '', subject: services[0], level: '', phone: '', rate: '2000', status: 'активный' },
  )

  if (!state) return null
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit({
      name: form.name.trim(),
      subject: form.subject,
      level: form.level.trim() || '—',
      phone: form.phone.trim() || '—',
      rate: Number(form.rate) || 0,
      status: form.status,
    })
  }

  return (
    <Modal open={!!state} onClose={onClose} title={isEdit ? `Редактировать` : `Добавить ${labels.personAcc}`}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-600">Имя и фамилия</span>
          <input className={fieldClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Иван Иванов" autoFocus />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">{labels.catalog}</span>
            <Select value={form.subject} onChange={(v) => set('subject', v)} className="w-full">
              {services.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">{labels.level}</span>
            <input className={fieldClass} value={form.level} onChange={(e) => set('level', e.target.value)} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Телефон</span>
            <input className={fieldClass} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+7 900 000-00-00" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">{labels.rate}, ₽</span>
            <input className={fieldClass} type="number" min="0" step="100" value={form.rate} onChange={(e) => set('rate', e.target.value)} />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-600">Статус</span>
          <Select value={form.status} onChange={(v) => set('status', v)} className="w-full">
            <option value="активный">Активный</option>
            <option value="на паузе">На паузе</option>
          </Select>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
          <Button type="submit" disabled={!form.name.trim()}>{isEdit ? 'Сохранить' : 'Добавить'}</Button>
        </div>
      </form>
    </Modal>
  )
}
