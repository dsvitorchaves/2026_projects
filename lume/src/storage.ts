import type { Habit, HabitTone } from './types'
import { dateKey } from './dates'

const KEY = 'lume-habits'
const SEED_KEY = 'lume-demo-v2'
const TONES: HabitTone[] = ['ember', 'sage', 'ocean', 'clay']

function recentKeys(count: number) {
  const keys: string[] = []
  const cursor = new Date()
  for (let i = 0; i < count; i++) {
    keys.push(dateKey(cursor))
    cursor.setDate(cursor.getDate() - 1)
  }
  return keys
}

function demoHabits(): Habit[] {
  const d = recentKeys(7)
  const now = new Date().toISOString()

  return [
    {
      id: 'demo-1',
      name: 'Hidratação',
      goal: 'Meta: 8 copos',
      tone: 'ocean',
      createdAt: now,
      checks: [d[0], d[1], d[2], d[4]],
      target: 8,
      unit: 'copos',
      counts: { [d[0]]: 6, [d[1]]: 8, [d[2]]: 5 },
    },
    {
      id: 'demo-2',
      name: 'Meditação',
      goal: 'Meta: 15 minutos',
      tone: 'sage',
      createdAt: now,
      checks: [d[0], d[1], d[2], d[3], d[4]],
    },
    {
      id: 'demo-3',
      name: 'Treino',
      goal: 'Meta: 30 minutos',
      tone: 'ember',
      createdAt: now,
      checks: [d[0], d[2], d[4]],
    },
    {
      id: 'demo-4',
      name: 'Leitura',
      goal: 'Meta: 10 páginas',
      tone: 'clay',
      createdAt: now,
      checks: [d[0], d[1], d[3], d[5]],
    },
    {
      id: 'demo-5',
      name: 'Caminhada',
      goal: 'Meta: 4 km',
      tone: 'sage',
      createdAt: now,
      checks: [d[1], d[3], d[6]],
    },
    {
      id: 'demo-6',
      name: 'Diário',
      goal: 'Meta: escrever de noite',
      tone: 'clay',
      createdAt: now,
      checks: [d[0], d[1], d[2]],
    },
    {
      id: 'demo-7',
      name: 'Estudar inglês',
      goal: 'Meta: 20 minutos',
      tone: 'ocean',
      createdAt: now,
      checks: [d[0], d[2], d[3], d[5]],
    },
    {
      id: 'demo-8',
      name: 'Dormir cedo',
      goal: 'Meta: antes das 23h',
      tone: 'ember',
      createdAt: now,
      checks: [d[1], d[2], d[4]],
    },
    {
      id: 'demo-9',
      name: 'Sem rede social',
      goal: 'Meta: manhã livre',
      tone: 'sage',
      createdAt: now,
      checks: [d[0], d[3]],
    },
    {
      id: 'demo-10',
      name: 'Alongamento',
      goal: 'Meta: 10 minutos',
      tone: 'ocean',
      createdAt: now,
      checks: [d[0], d[1], d[2], d[3], d[4], d[5]],
    },
  ]
}

function normalize(raw: unknown): Habit[] {
  if (!Array.isArray(raw)) return []

  return raw.map((item, index) => {
    const row = item as Partial<Habit> & { name?: string }
    return {
      id: row.id ?? crypto.randomUUID(),
      name: row.name ?? 'Hábito',
      goal: row.goal ?? 'Meta: manter o ritmo',
      tone: row.tone ?? TONES[index % TONES.length],
      createdAt: row.createdAt ?? new Date().toISOString(),
      checks: Array.isArray(row.checks) ? row.checks : [],
      target: row.target,
      unit: row.unit,
      counts: row.counts,
    }
  })
}

export function loadHabits(): Habit[] {
  try {
    if (!localStorage.getItem(SEED_KEY)) {
      const demo = demoHabits()
      localStorage.setItem(KEY, JSON.stringify(demo))
      localStorage.setItem(SEED_KEY, '1')
      return demo
    }

    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return normalize(JSON.parse(raw))
  } catch {
    return demoHabits()
  }
}

export function saveHabits(habits: Habit[]) {
  localStorage.setItem(KEY, JSON.stringify(habits))
  localStorage.setItem(SEED_KEY, '1')
}

export function nextTone(habits: Habit[]): HabitTone {
  return TONES[habits.length % TONES.length]
}
