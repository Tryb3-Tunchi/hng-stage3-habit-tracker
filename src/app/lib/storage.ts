import type { User, Session } from '@/types/auth'
import type { Habit } from '@/types/habit'

const USERS_KEY = 'habit-tracker-users'
const SESSION_KEY = 'habit-tracker-session'
const HABITS_KEY = 'habit-tracker-habits'

// ── Users ────────────────────────────────────────────────
export function getUsers(): User[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function findUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email === email)
}

export function createUser(email: string, password: string): User {
  const users = getUsers()
  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    password,
    createdAt: new Date().toISOString(),
  }
  saveUsers([...users, newUser])
  return newUser
}

// ── Session ───────────────────────────────────────────────
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw || raw === 'null') return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.setItem(SESSION_KEY, 'null')
}

// ── Habits ────────────────────────────────────────────────
export function getHabits(): Habit[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(HABITS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveHabits(habits: Habit[]): void {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
}

export function getHabitsByUser(userId: string): Habit[] {
  return getHabits().filter(h => h.userId === userId)
}

export function createHabit(
  userId: string,
  name: string,
  description: string
): Habit {
  const habits = getHabits()
  const newHabit: Habit = {
    id: crypto.randomUUID(),
    userId,
    name,
    description,
    frequency: 'daily',
    createdAt: new Date().toISOString(),
    completions: [],
  }
  saveHabits([...habits, newHabit])
  return newHabit
}

export function updateHabit(updated: Habit): void {
  const habits = getHabits()
  saveHabits(habits.map(h => (h.id === updated.id ? updated : h)))
}

export function deleteHabit(id: string): void {
  const habits = getHabits()
  saveHabits(habits.filter(h => h.id !== id))
}