// Производные данные для экранов: статистика ученика, KPI, ряды для графиков.
// Всё считается из текущего состояния (students / lessons / payments),
// поэтому цифры на экранах всегда сходятся с моками.

import { startOfToday, startOfWeek, addDays, parseISODate, pad } from './date.js'

export function indexById(items) {
  const map = {}
  for (const item of items) map[item.id] = item
  return map
}

// Статистика по одному ученику.
export function studentStats(student, lessons, payments) {
  const own = lessons.filter((l) => l.studentId === student.id)
  const conducted = own.filter((l) => l.status === 'проведено')
  const planned = own.filter((l) => l.status === 'запланировано')
  const cancelled = own.filter((l) => l.status === 'отменено')
  const totalPaid = payments
    .filter((p) => p.studentId === student.id)
    .reduce((sum, p) => sum + p.amount, 0)
  const balance = totalPaid - conducted.length * student.rate
  return {
    conductedCount: conducted.length,
    plannedCount: planned.length,
    cancelledCount: cancelled.length,
    totalPaid,
    balance,
    lessons: own,
  }
}

// KPI для экрана «Обзор».
export function computeKpis(students, lessons) {
  const today = startOfToday()
  const year = today.getFullYear()
  const month = today.getMonth()
  const rateOf = indexById(students)

  const inThisMonth = (l) => {
    const d = parseISODate(l.date)
    return d.getFullYear() === year && d.getMonth() === month
  }

  const monthLessons = lessons.filter(inThisMonth)
  const conducted = monthLessons.filter((l) => l.status === 'проведено')
  const cancelled = monthLessons.filter((l) => l.status === 'отменено')

  const revenue = conducted.reduce(
    (sum, l) => sum + (rateOf[l.studentId]?.rate || 0),
    0,
  )
  const lessonsThisMonth = monthLessons.filter((l) => l.status !== 'отменено').length

  // Посещаемость: доля проведённых среди уже состоявшихся (проведено + отменено).
  const settled = conducted.length + cancelled.length
  const attendance = settled ? Math.round((conducted.length / settled) * 100) : null

  return {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.status === 'активный').length,
    lessonsThisMonth,
    revenue,
    attendance,
  }
}

// Выручка по неделям за последние `weeks` ЗАВЕРШЁННЫХ недель (для линейного
// графика). Текущую (неполную) неделю исключаем — иначе график обрывается вниз
// и читается как «спад», хотя неделя просто ещё не закончилась.
export function weeklyRevenue(lessons, students, weeks = 6) {
  const rateOf = indexById(students)
  const thisMonday = startOfWeek(startOfToday())
  const buckets = []

  for (let i = weeks; i >= 1; i--) {
    const start = addDays(thisMonday, -7 * i)
    const end = addDays(start, 7)
    const revenue = lessons
      .filter((l) => {
        if (l.status !== 'проведено') return false
        const d = parseISODate(l.date)
        return d >= start && d < end
      })
      .reduce((sum, l) => sum + (rateOf[l.studentId]?.rate || 0), 0)
    buckets.push({ week: `${pad(start.getDate())}.${pad(start.getMonth() + 1)}`, revenue })
  }
  return buckets
}

// Число занятий по предметам (для столбчатого графика), без отменённых.
export function lessonsBySubject(lessons) {
  const counts = {}
  for (const l of lessons) {
    if (l.status === 'отменено') continue
    counts[l.subject] = (counts[l.subject] || 0) + 1
  }
  return Object.entries(counts)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)
}

// Должники: ученики с отрицательным балансом.
export function debtorList(students, lessons, payments) {
  return students
    .map((student) => ({ student, stats: studentStats(student, lessons, payments) }))
    .filter((x) => x.stats.balance < 0)
}

// Сводка по долгам: количество должников и суммарный долг (отрицательное число).
export function debtSummary(students, lessons, payments) {
  const list = debtorList(students, lessons, payments)
  const total = list.reduce((sum, x) => sum + x.stats.balance, 0)
  return { count: list.length, total }
}

// Ближайшие будущие занятия (для блока «Ближайшие занятия»).
export function upcomingLessons(lessons, students, limit = 5) {
  const today = startOfToday()
  const nameOf = indexById(students)
  return lessons
    .filter((l) => l.status === 'запланировано' && parseISODate(l.date) >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, limit)
    .map((l) => ({ ...l, studentName: nameOf[l.studentId]?.name || '—' }))
}
