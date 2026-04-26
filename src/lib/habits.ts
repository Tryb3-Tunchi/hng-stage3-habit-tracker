import type { Habit } from '@/types/habit'

export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  const completions = [...habit.completions]
  const index = completions.indexOf(date)

  if (index === -1) {
    completions.push(date)
  } else {
    completions.splice(index, 1)
  }

  // Ensure no duplicates — Array.from avoids downlevelIteration issue
  const unique = Array.from(new Set(completions))

  return { ...habit, completions: unique }
}