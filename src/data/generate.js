// Общий движок генерации демо-данных: из массива учеников/клиентов строит
// занятия и оплаты относительно сегодняшней даты. Логика одна для всех ниш —
// меняются только входные данные профиля (см. config.js).
// Детерминированно (seed), поэтому при перезагрузке данные не «прыгают».

import { mulberry32 } from '../lib/seed.js'
import { startOfToday, addDays, toISODate } from '../lib/date.js'

const TIMES = ['10:00', '11:30', '13:00', '15:00', '16:30', '18:00', '19:30']
const METHODS = ['перевод', 'наличные']
const PAY_OFFSETS = [-7, -21, -35, -42]

function buildLessons(students) {
  const rand = mulberry32(20260617)
  const today = startOfToday()
  const out = []
  let id = 1

  students.forEach((student, idx) => {
    const isActive = student.status === 'активный'
    const weekday = 1 + (idx % 6) // Пн..Сб
    const time = TIMES[idx % TIMES.length]
    const duration = idx % 3 === 0 ? 90 : 60

    const base = new Date(today)
    let back = ((base.getDay() + 6) % 7) - (weekday - 1)
    if (back <= 0) back += 7
    base.setDate(base.getDate() - back)

    const add = (d, status) => {
      out.push({
        id: `l${id++}`,
        studentId: student.id,
        date: toISODate(d),
        time,
        subject: student.subject,
        duration,
        status,
      })
    }

    // Прошлое: распределяем по 6 неделям (для графика выручки по неделям).
    const pPast = isActive ? 0.5 : 0.38
    for (let week = 1; week <= 6; week++) {
      if (rand() < pPast) {
        add(addDays(base, -7 * (week - 1)), rand() < 0.1 ? 'отменено' : 'проведено')
      }
    }

    // Будущее: только у активных, на ближайшие 1–2 недели (всегда «запланировано»).
    if (isActive) {
      if (idx % 2 === 0) add(addDays(base, 7), 'запланировано')
      if (idx % 4 === 1) add(addDays(base, 14), 'запланировано')
    }
  })

  out.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  return out
}

function buildPayments(students, lessons) {
  const today = startOfToday()
  const out = []
  let id = 1

  students.forEach((student, idx) => {
    const conducted = lessons.filter(
      (l) => l.studentId === student.id && l.status === 'проведено',
    ).length

    // Сценарий оплаты по индексу → наглядный разброс баланса (долг / ровно / предоплата).
    const scenario = idx % 3
    let delta
    if (scenario === 0) delta = -(1 + (idx % 2))
    else if (scenario === 1) delta = 0
    else delta = 1 + (idx % 2)

    let paidLessons = Math.max(0, conducted + delta)

    let pi = 0
    while (paidLessons > 0 && pi < PAY_OFFSETS.length) {
      const chunk = Math.min(paidLessons, 2 + (idx % 2))
      out.push({
        id: `p${id++}`,
        studentId: student.id,
        date: toISODate(addDays(today, PAY_OFFSETS[pi])),
        amount: chunk * student.rate,
        method: METHODS[pi % METHODS.length],
      })
      paidLessons -= chunk
      pi++
    }
  })

  out.sort((a, b) => b.date.localeCompare(a.date))
  return out
}

// Строит полный согласованный датасет для профиля ниши.
export function buildDataset(students) {
  const lessons = buildLessons(students)
  const payments = buildPayments(students, lessons)
  return { students, lessons, payments }
}
