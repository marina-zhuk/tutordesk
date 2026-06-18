// Форматирование чисел и денег в русской локали.

const currency = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

const number = new Intl.NumberFormat('ru-RU')

export function formatCurrency(value) {
  return currency.format(value || 0)
}

export function formatNumber(value) {
  return number.format(value || 0)
}
