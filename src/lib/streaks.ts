export function calculateCurrentStreak(
  completions: string[],
  today?: string
): number {
  const todayDate = today ?? new Date().toISOString().split('T')[0]

  // Remove duplicates and sort descending — Array.from avoids downlevelIteration
  const unique = Array.from(new Set(completions)).sort((a, b) =>
    b.localeCompare(a)
  )

  // If today is not completed, streak is 0
  if (!unique.includes(todayDate)) return 0

  let streak = 0
  const current = new Date(todayDate)

  for (let i = 0; i < unique.length; i++) {
    const expected = current.toISOString().split('T')[0]
    if (unique[i] === expected) {
      streak++
      current.setDate(current.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}