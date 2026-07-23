const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const

export function dateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey() {
  return dateKey(new Date())
}

export function parseKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function startOfWeek(date: Date) {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function weekDays(anchor: Date) {
  const start = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    return {
      date,
      key: dateKey(date),
      label: WEEKDAYS[date.getDay()],
      day: date.getDate(),
    }
  })
}

export function weekRangeLabel(anchor: Date) {
  const days = weekDays(anchor)
  const first = days[0].date
  const last = days[6].date
  const month = last
    .toLocaleDateString('pt-BR', { month: 'long' })
    .toUpperCase()

  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()} – ${last.getDate()} DE ${month}`
  }

  const firstMonth = first
    .toLocaleDateString('pt-BR', { month: 'short' })
    .replace('.', '')
    .toUpperCase()
  return `${first.getDate()} ${firstMonth} – ${last.getDate()} ${month}`
}

export function streakFrom(checks: string[], until = todayKey()) {
  const set = new Set(checks)
  let streak = 0
  const cursor = parseKey(until)

  while (true) {
    const key = dateKey(cursor)
    if (!set.has(key)) break
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function weekCheckCount(checks: string[], anchor: Date) {
  const keys = new Set(weekDays(anchor).map((d) => d.key))
  return checks.filter((c) => keys.has(c)).length
}
