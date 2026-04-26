'use client'

import { useState } from 'react'
import { getHabitSlug } from '@/lib/slug'
import { calculateCurrentStreak } from '@/lib/streaks'
import type { Habit } from '@/types/habit'

interface HabitCardProps {
  habit: Habit
  onToggleComplete: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function HabitCard({
  habit,
  onToggleComplete,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const slug = getHabitSlug(habit.name)
  const today = new Date().toISOString().split('T')[0]
  const isCompletedToday = habit.completions.includes(today)
  const streak = calculateCurrentStreak(habit.completions)

  function handleDeleteConfirm() {
    setShowDeleteConfirm(false)
    onDelete()
  }

  return (
    <div
      data-testid={`habit-card-${slug}`}
      className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
        isCompletedToday
          ? 'border-green-300 bg-green-50'
          : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: complete toggle + info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            data-testid={`habit-complete-${slug}`}
            onClick={onToggleComplete}
            aria-label={
              isCompletedToday
                ? `Mark ${habit.name} incomplete`
                : `Mark ${habit.name} complete`
            }
            className={`mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              isCompletedToday
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-slate-300 hover:border-indigo-400'
            }`}
          >
            {isCompletedToday && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p
              className={`font-semibold text-slate-800 truncate ${
                isCompletedToday ? 'line-through text-slate-400' : ''
              }`}
            >
              {habit.name}
            </p>
            {habit.description && (
              <p className="text-sm text-slate-400 mt-0.5 truncate">
                {habit.description}
              </p>
            )}
            {/* Streak */}
            <p
              data-testid={`habit-streak-${slug}`}
              className="text-xs mt-1.5 font-medium text-indigo-600"
            >
              🔥 {streak} day{streak !== 1 ? 's' : ''} streak
            </p>
          </div>
        </div>

        {/* Right: edit + delete */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            data-testid={`habit-edit-${slug}`}
            onClick={onEdit}
            aria-label={`Edit ${habit.name}`}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            data-testid={`habit-delete-${slug}`}
            onClick={() => setShowDeleteConfirm(true)}
            aria-label={`Delete ${habit.name}`}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="mt-4 pt-4 border-t border-red-200">
          <p className="text-sm text-slate-600 mb-3">
            Delete <strong>{habit.name}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-2 text-sm border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              data-testid="confirm-delete-button"
              onClick={handleDeleteConfirm}
              className="flex-1 py-2 text-sm bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}