import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Habit, HabitTone } from './types'
import { loadHabits, nextTone, saveHabits } from './storage'
import {
  dateKey,
  parseKey,
  streakFrom,
  todayKey,
  weekCheckCount,
  weekDays,
  weekRangeLabel,
} from './dates'

const toneClass: Record<HabitTone, { icon: string; fill: string }> = {
  ember: { icon: 'text-[var(--ember)]', fill: 'bg-[var(--ember-bg)]' },
  sage: { icon: 'text-[var(--sage)]', fill: 'bg-[var(--sage-bg)]' },
  ocean: { icon: 'text-[var(--ocean)]', fill: 'bg-[var(--ocean-bg)]' },
  clay: { icon: 'text-[var(--clay)]', fill: 'bg-[var(--clay-bg)]' },
}

function HabitIcon({ tone }: { tone: HabitTone }) {
  const common = 'h-6 w-6'
  if (tone === 'sage') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 20c4-3 6-6 6-9a6 6 0 1 0-12 0c0 3 2 6 6 9z" />
        <path d="M12 11v3" />
      </svg>
    )
  }
  if (tone === 'ocean') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 14c2 0 3-2 5-2s3 2 5 2 3-2 5-2" />
        <path d="M4 18c2 0 3-2 5-2s3 2 5 2 3-2 5-2" />
        <path d="M12 5v5" />
      </svg>
    )
  }
  if (tone === 'clay') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 19h14" />
        <path d="M7 19V9l5-5 5 5v10" />
        <path d="M10 19v-5h4v5" />
      </svg>
    )
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3c2.5 3.4 5 6.2 5 9.5a5 5 0 1 1-10 0C7 9.2 9.5 6.4 12 3z" />
    </svg>
  )
}

function App() {
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits())
  const [selectedKey, setSelectedKey] = useState(todayKey)
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [showForm, setShowForm] = useState(false)

  const selectedDate = useMemo(() => parseKey(selectedKey), [selectedKey])
  const days = useMemo(() => weekDays(selectedDate), [selectedDate])
  const rangeLabel = useMemo(() => weekRangeLabel(selectedDate), [selectedDate])

  useEffect(() => {
    saveHabits(habits)
  }, [habits])

  function addHabit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    setHabits((prev) => [
      {
        id: crypto.randomUUID(),
        name: trimmed,
        goal: goal.trim() || 'Meta: manter o ritmo',
        tone: nextTone(prev),
        createdAt: new Date().toISOString(),
        checks: [],
      },
      ...prev,
    ])
    setName('')
    setGoal('')
    setShowForm(false)
  }

  function toggleDay(id: string) {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit
        const done = habit.checks.includes(selectedKey)
        return {
          ...habit,
          checks: done
            ? habit.checks.filter((d) => d !== selectedKey)
            : [...habit.checks, selectedKey],
        }
      }),
    )
  }

  function bumpCount(id: string) {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id || !habit.target) return habit
        const current = habit.counts?.[selectedKey] ?? 0
        const next = Math.min(habit.target, current + 1)
        const counts = { ...habit.counts, [selectedKey]: next }
        const reached = next >= habit.target
        const checks = new Set(habit.checks)
        if (reached) checks.add(selectedKey)
        return { ...habit, counts, checks: [...checks] }
      }),
    )
  }

  function removeHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }

  function shiftWeek(delta: number) {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + delta * 7)
    setSelectedKey(dateKey(next))
  }

  const doneSelected = habits.filter((h) => h.checks.includes(selectedKey)).length
  const isToday = selectedKey === todayKey()

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-8">
      <header className="mb-6 text-center">
        <p className="brand text-2xl font-semibold tracking-tight text-[var(--ink)]">
          Lume
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => shiftWeek(-1)}
            className="rounded-full px-3 py-1 text-[var(--muted)] transition hover:bg-black/5"
            aria-label="Semana anterior"
          >
            ‹
          </button>
          <p className="text-xs font-semibold tracking-[0.14em] text-[var(--muted)]">
            {rangeLabel}
          </p>
          <button
            type="button"
            onClick={() => shiftWeek(1)}
            className="rounded-full px-3 py-1 text-[var(--muted)] transition hover:bg-black/5"
            aria-label="Próxima semana"
          >
            ›
          </button>
        </div>

        <div className="mt-4 flex items-end justify-between px-1">
          {days.map((day) => {
            const active = day.key === selectedKey
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedKey(day.key)}
                className={`flex min-w-10 flex-col items-center gap-1 rounded-full px-1.5 py-2 transition ${
                  active
                    ? 'bg-[var(--accent)] text-white shadow-[0_8px_20px_rgba(217,120,58,0.35)]'
                    : 'text-[var(--ink)] hover:bg-black/5'
                }`}
              >
                <span className={`text-[11px] font-medium ${active ? 'text-white/90' : 'text-[var(--muted)]'}`}>
                  {day.label}
                </span>
                <span className="text-sm font-semibold">{day.day}</span>
              </button>
            )
          })}
        </div>

        <p className="mt-4 text-sm text-[var(--muted)]">
          {habits.length === 0
            ? 'Comece com um hábito pequeno.'
            : `${doneSelected} de ${habits.length} ${isToday ? 'hoje' : 'neste dia'}`}
        </p>
      </header>

      <ul className="space-y-3">
        {habits.map((habit) => {
          const done = habit.checks.includes(selectedKey)
          const streak = streakFrom(habit.checks, selectedKey)
          const weekHits = weekCheckCount(habit.checks, selectedDate)
          const colors = toneClass[habit.tone]
          const count = habit.counts?.[selectedKey] ?? 0
          const hasTarget = typeof habit.target === 'number' && habit.target > 0
          const segments = hasTarget ? 4 : 7
          const filled = hasTarget
            ? Math.round((count / habit.target!) * segments)
            : weekHits

          return (
            <li
              key={habit.id}
              className="rounded-[22px] bg-[var(--surface)] p-4 shadow-[0_10px_30px_rgba(40,30,20,0.06)]"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${colors.fill} ${colors.icon}`}
                >
                  <HabitIcon tone={habit.tone} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold tracking-tight">
                        {habit.name}
                      </p>
                      <p className="mt-0.5 text-sm text-[var(--muted)]">
                        {habit.goal.startsWith('Meta') ? habit.goal : `Meta: ${habit.goal}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleDay(habit.id)}
                      aria-label={done ? 'Desmarcar' : 'Concluir'}
                      className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition ${
                        done
                          ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                          : 'border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)]'
                      }`}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M5 12.5 10 17l9-10" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex flex-1 gap-1.5">
                      {Array.from({ length: segments }, (_, i) => (
                        <span
                          key={i}
                          className={`h-2 flex-1 rounded-full ${
                            i < filled ? 'bg-[var(--accent)]' : 'bg-[var(--line)]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="shrink-0 text-xs font-medium text-[var(--muted)]">
                      {hasTarget
                        ? `${count} / ${habit.target} ${habit.unit ?? ''}`
                        : streak > 0
                          ? `${streak}d`
                          : `${weekHits}/7`}
                    </span>
                  </div>

                  {hasTarget && count < habit.target! && (
                    <button
                      type="button"
                      onClick={() => bumpCount(habit.id)}
                      className="mt-3 text-sm font-medium text-[var(--accent)]"
                    >
                      +1 {habit.unit ?? 'unidade'}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeHabit(habit.id)}
                  className="text-xs text-[var(--muted)] transition hover:text-[#b54a3c]"
                >
                  remover
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {habits.length === 0 && !showForm && (
        <p className="mt-12 text-center text-sm text-[var(--muted)]">
          Nada por aqui ainda.
        </p>
      )}

      {showForm ? (
        <form
          onSubmit={addHabit}
          className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--line)] bg-[var(--surface)] px-4 py-4 shadow-[0_-12px_40px_rgba(40,30,20,0.08)]"
        >
          <div className="mx-auto flex max-w-md flex-col gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do hábito"
              autoFocus
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--accent)]"
            />
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Meta (ex: 20 minutos)"
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--accent)]"
            />
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl px-4 py-2.5 text-[var(--muted)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-2.5 font-semibold text-white"
              >
                Salvar
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="fixed bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(29,26,22,0.25)]"
        >
          + Novo hábito
        </button>
      )}
    </div>
  )
}

export default App
