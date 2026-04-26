'use client'

import { useState } from 'react'
import { validateHabitName } from '@/lib/validators'

interface HabitFormProps {
  initialName?: string
  initialDescription?: string
  onSubmit: (name: string, description: string) => void
  onCancel: () => void
  isEditing?: boolean
}

export default function HabitForm({
  initialName = '',
  initialDescription = '',
  onSubmit,
  onCancel,
  isEditing = false,
}: HabitFormProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [nameError, setNameError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validation = validateHabitName(name)
    if (!validation.valid) {
      setNameError(validation.error)
      return
    }
    setNameError(null)
    onSubmit(validation.value, description.trim())
  }

  return (
    <div
      data-testid="habit-form"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
    >
      <h2 className="text-lg font-bold text-slate-800 mb-5">
        {isEditing ? 'Edit Habit' : 'New Habit'}
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label
            htmlFor="habit-name"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Habit name <span className="text-red-500">*</span>
          </label>
          <input
            id="habit-name"
            data-testid="habit-name-input"
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value)
              setNameError(null)
            }}
            className={`w-full px-4 py-2.5 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              nameError ? 'border-red-400 bg-red-50' : 'border-slate-300'
            }`}
            placeholder="e.g. Drink Water"
            maxLength={70}
          />
          {nameError && (
            <p role="alert" className="text-sm text-red-600 mt-1 font-medium">
              {nameError}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="habit-description"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Description{' '}
            <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="habit-description"
            data-testid="habit-description-input"
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Add a short description"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="habit-frequency"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Frequency
          </label>
          <select
            id="habit-frequency"
            data-testid="habit-frequency-select"
            defaultValue="daily"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="daily">Daily</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-300 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            data-testid="habit-save-button"
            type="submit"
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            {isEditing ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </form>
    </div>
  )
}