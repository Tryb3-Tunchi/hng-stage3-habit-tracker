import { describe, it, expect } from 'vitest'
import { calculateCurrentStreak } from '@/lib/streaks'

/* MENTOR_TRACE_STAGE3_HABIT_A91 */
describe('calculateCurrentStreak', () => {
  const today = new Date().toISOString().split('T')[0]

  function daysAgo(n: number): string {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString().split('T')[0]
  }

  it('returns 0 when completions is empty', () => {
    expect(calculateCurrentStreak([])).toBe(0)
  })

  it('returns 0 when today is not completed', () => {
    const yesterday = daysAgo(1)
    expect(calculateCurrentStreak([yesterday])).toBe(0)
  })

  it('returns the correct streak for consecutive completed days', () => {
    const yesterday = daysAgo(1)
    const twoDaysAgo = daysAgo(2)
    expect(calculateCurrentStreak([today])).toBe(1)
    expect(calculateCurrentStreak([today, yesterday])).toBe(2)
    expect(calculateCurrentStreak([today, yesterday, twoDaysAgo])).toBe(3)
  })

  it('ignores duplicate completion dates', () => {
    expect(calculateCurrentStreak([today, today, today])).toBe(1)
    const yesterday = daysAgo(1)
    expect(calculateCurrentStreak([today, today, yesterday, yesterday])).toBe(2)
  })

  it('breaks the streak when a calendar day is missing', () => {
    const twoDaysAgo = daysAgo(2)
    // today is completed but yesterday is missing — streak is 1
    expect(calculateCurrentStreak([today, twoDaysAgo])).toBe(1)
  })
})