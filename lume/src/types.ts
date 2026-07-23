export type HabitTone = 'ember' | 'sage' | 'ocean' | 'clay'

export type Habit = {
  id: string
  name: string
  goal: string
  tone: HabitTone
  createdAt: string
  checks: string[]
  target?: number
  unit?: string
  counts?: Record<string, number>
}
