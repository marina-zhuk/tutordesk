// Небольшие помощники для дат. Даты занятий/оплат хранятся строкой 'YYYY-MM-DD'.

export const MONTHS_NOM = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

export const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

export const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function pad(n) {
  return String(n).padStart(2, '0')
}

export function toISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseISODate(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

// Понедельник недели, в которую попадает date.
export function startOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const dow = (d.getDay() + 6) % 7 // Пн = 0
  return addDays(d, -dow)
}

// Сетка месяца: 6 недель по 7 дней, начиная с понедельника.
export function monthGrid(year, month) {
  const first = new Date(year, month, 1)
  const start = startOfWeek(first)
  const weeks = []
  for (let w = 0; w < 6; w++) {
    const days = []
    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, w * 7 + i))
    }
    weeks.push(days)
  }
  return weeks
}

// '5 июня'
export function formatDateHuman(iso) {
  const d = parseISODate(iso)
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`
}

// '05.06.2026'
export function formatDateNumeric(iso) {
  const d = parseISODate(iso)
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}
