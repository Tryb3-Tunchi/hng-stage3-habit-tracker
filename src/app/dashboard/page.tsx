'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  getSession,
  clearSession,
  getHabitsByUser,
  createHabit,
  updateHabit,
  deleteHabit,
} from '@/lib/storage'
import { toggleHabitCompletion } from '@/lib/habits'
import { validateHabitName } from '@/lib/validators'
import HabitCard from '@/components/habits/HabitCard'
import HabitForm from '@/components/habits/HabitForm'
import type { Session } from '@/types/auth'
import type { Habit } from '@/types/habit'

export default function DashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = getSession()
    if (!s) {
      router.replace('/login')
      return
    }
    setSession(s)
    setHabits(getHabitsByUser(s.userId))
    setLoading(false)
  }, [router])

  const refreshHabits = useCallback(() => {
    if (session) setHabits(getHabitsByUser(session.userId))
  }, [session])

  function handleLogout() {
    clearSession()
    router.replace('/login')
  }

  function handleCreateHabit(name: string, description: string) {
    if (!session) return
    const validation = validateHabitName(name)
    if (!validation.valid) return
    createHabit(session.userId, validation.value, description)
    refreshHabits()
    setShowForm(false)
  }

  function handleEditHabit(name: string, description: string) {
    if (!editingHabit) return
    const validation = validateHabitName(name)
    if (!validation.valid) return
    const updated: Habit = {
      ...editingHabit,
      name: validation.value,
      description,
    }
    updateHabit(updated)
    refreshHabits()
    setEditingHabit(null)
  }

  function handleDeleteHabit(id: string) {
    deleteHabit(id)
    refreshHabits()
  }

  function handleToggleComplete(habit: Habit) {
    const today = new Date().toISOString().split('T')[0]
    const updated = toggleHabitCompletion(habit, today)
    updateHabit(updated)
    refreshHabits()
  }

  function handleEdit(habit: Habit) {
    setEditingHabit(habit)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">Loading…</p>
      </div>
    )
  }

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-indigo-600">Habit Tracker</h1>
            <p className="text-xs text-slate-400">{session?.email}</p>
          </div>
          <button
            data-testid="auth-logout-button"
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-red-500 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Create habit button */}
        {!showForm && !editingHabit && (
          <button
            data-testid="create-habit-button"
            onClick={() => setShowForm(true)}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors mb-6 flex items-center justify-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            New Habit
          </button>
        )}

        {/* Create form */}
        {showForm && (
          <HabitForm
            onSubmit={handleCreateHabit}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Edit form */}
        {editingHabit && (
          <HabitForm
            initialName={editingHabit.name}
            initialDescription={editingHabit.description}
            onSubmit={handleEditHabit}
            onCancel={() => setEditingHabit(null)}
            isEditing
          />
        )}

        {/* Habit list */}
        {habits.length === 0 && !showForm && !editingHabit ? (
          <div
            data-testid="empty-state"
            className="text-center py-16 text-slate-400"
          >
            <div className="text-5xl mb-4">✨</div>
            <p className="text-lg font-medium text-slate-500">No habits yet</p>
            <p className="text-sm mt-1">Click "New Habit" to get started</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {habits.map(habit => (
              <li key={habit.id}>
                <HabitCard
                  habit={habit}
                  onToggleComplete={() => handleToggleComplete(habit)}
                  onEdit={() => handleEdit(habit)}
                  onDelete={() => handleDeleteHabit(habit.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}