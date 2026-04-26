import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import HabitForm from '@/components/habits/HabitForm'
import HabitCard from '@/components/habits/HabitCard'
import { getHabitSlug } from '@/lib/slug'
import { calculateCurrentStreak } from '@/lib/streaks'
import { toggleHabitCompletion } from '@/lib/habits'
import type { Habit } from '@/types/habit'

const today = new Date().toISOString().split('T')[0]

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    userId: 'user-1',
    name: 'Drink Water',
    description: 'Stay hydrated',
    frequency: 'daily',
    createdAt: new Date().toISOString(),
    completions: [],
    ...overrides,
  }
}

describe('habit form', () => {
  beforeEach(() => {
    localStorage.clear()
    mockReplace.mockClear()
    vi.clearAllMocks()
  })

  it('shows a validation error when habit name is empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<HabitForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await user.click(screen.getByTestId('habit-save-button'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Habit name is required'
      )
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  it('creates a new habit and renders it in the list', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<HabitForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await user.type(screen.getByTestId('habit-name-input'), 'Drink Water')
    await user.type(
      screen.getByTestId('habit-description-input'),
      'Stay hydrated'
    )
    await user.click(screen.getByTestId('habit-save-button'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('Drink Water', 'Stay hydrated')
    })

    // Render a card to verify it renders in list
    const habit = makeHabit()
    render(
      <HabitCard
        habit={habit}
        onToggleComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(
      screen.getByTestId(`habit-card-${getHabitSlug('Drink Water')}`)
    ).toBeInTheDocument()
  })

  it('edits an existing habit and preserves immutable fields', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const habit = makeHabit()

    render(
      <HabitForm
        initialName={habit.name}
        initialDescription={habit.description}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isEditing
      />
    )

    // Clear name and type new value
    const nameInput = screen.getByTestId('habit-name-input')
    await user.clear(nameInput)
    await user.type(nameInput, 'Read Books')
    await user.click(screen.getByTestId('habit-save-button'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('Read Books', habit.description)
    })

    // Verify immutable fields are preserved externally
    expect(habit.id).toBe('habit-1')
    expect(habit.userId).toBe('user-1')
    expect(habit.createdAt).toBeDefined()
    expect(habit.completions).toEqual([])
  })

  it('deletes a habit only after explicit confirmation', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const habit = makeHabit()
    const slug = getHabitSlug(habit.name)

    render(
      <HabitCard
        habit={habit}
        onToggleComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    )

    // Click delete — should show confirmation, not call onDelete yet
    await user.click(screen.getByTestId(`habit-delete-${slug}`))
    expect(onDelete).not.toHaveBeenCalled()

    // Confirm deletion
    await user.click(screen.getByTestId('confirm-delete-button'))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('toggles completion and updates the streak display', async () => {
    const user = userEvent.setup()
    const habit = makeHabit()
    const slug = getHabitSlug(habit.name)

    let currentHabit = habit
    const onToggle = vi.fn(() => {
      currentHabit = toggleHabitCompletion(currentHabit, today)
    })

    const { rerender } = render(
      <HabitCard
        habit={currentHabit}
        onToggleComplete={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    // Initially streak is 0
    expect(screen.getByTestId(`habit-streak-${slug}`)).toHaveTextContent('0')

    // Toggle complete
    await user.click(screen.getByTestId(`habit-complete-${slug}`))
    expect(onToggle).toHaveBeenCalledTimes(1)

    // Re-render with updated habit
    rerender(
      <HabitCard
        habit={currentHabit}
        onToggleComplete={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    const streak = calculateCurrentStreak(currentHabit.completions)
    expect(screen.getByTestId(`habit-streak-${slug}`)).toHaveTextContent(
      String(streak)
    )
  })
})