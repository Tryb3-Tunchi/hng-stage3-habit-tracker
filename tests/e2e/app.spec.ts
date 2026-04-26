import { test, expect } from '@playwright/test'

test.describe('Habit Tracker app', () => {
  // Helper: generate unique test email
  function uniqueEmail() {
    return `user_${Date.now()}@test.com`
  }

  // Helper: sign up a new user via UI and land on dashboard
  async function signUpAndLogin(page: any, email: string, password = 'password123') {
    await page.goto('/signup')
    await page.getByTestId('auth-signup-email').fill(email)
    await page.getByTestId('auth-signup-password').fill(password)
    await page.getByTestId('auth-signup-submit').click()
    await page.waitForURL('/dashboard')
  }

  // Clear localStorage between tests
  async function clearStorage(page: any) {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  }

  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await clearStorage(page)
    await page.goto('/')
    await expect(page.getByTestId('splash-screen')).toBeVisible()
    await page.waitForURL('/login', { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await clearStorage(page)
    const email = uniqueEmail()
    await signUpAndLogin(page, email)

    // Now go to / — should redirect to dashboard
    await page.goto('/')
    await page.waitForURL('/dashboard', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await clearStorage(page)
    await page.goto('/dashboard')
    await page.waitForURL('/login', { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await clearStorage(page)
    const email = uniqueEmail()
    await page.goto('/signup')
    await page.getByTestId('auth-signup-email').fill(email)
    await page.getByTestId('auth-signup-password').fill('securepass')
    await page.getByTestId('auth-signup-submit').click()
    await page.waitForURL('/dashboard')
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
  })

  test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
    await clearStorage(page)
    const email = uniqueEmail()

    // Signup
    await signUpAndLogin(page, email)

    // Create a habit
    await page.getByTestId('create-habit-button').click()
    await page.getByTestId('habit-name-input').fill('My Private Habit')
    await page.getByTestId('habit-save-button').click()
    await expect(page.getByTestId('habit-card-my-private-habit')).toBeVisible()

    // Logout
    await page.getByTestId('auth-logout-button').click()
    await page.waitForURL('/login')

    // Sign up as a different user
    const email2 = uniqueEmail()
    await page.goto('/signup')
    await page.getByTestId('auth-signup-email').fill(email2)
    await page.getByTestId('auth-signup-password').fill('pass2')
    await page.getByTestId('auth-signup-submit').click()
    await page.waitForURL('/dashboard')

    // Should NOT see first user's habit
    await expect(page.getByTestId('habit-card-my-private-habit')).not.toBeVisible()
    await expect(page.getByTestId('empty-state')).toBeVisible()
  })

  test('creates a habit from the dashboard', async ({ page }) => {
    await clearStorage(page)
    const email = uniqueEmail()
    await signUpAndLogin(page, email)

    await page.getByTestId('create-habit-button').click()
    await expect(page.getByTestId('habit-form')).toBeVisible()

    await page.getByTestId('habit-name-input').fill('Drink Water')
    await page.getByTestId('habit-description-input').fill('8 glasses a day')
    await page.getByTestId('habit-save-button').click()

    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible()
  })

  test('completes a habit for today and updates the streak', async ({ page }) => {
    await clearStorage(page)
    const email = uniqueEmail()
    await signUpAndLogin(page, email)

    // Create habit
    await page.getByTestId('create-habit-button').click()
    await page.getByTestId('habit-name-input').fill('Exercise')
    await page.getByTestId('habit-save-button').click()
    await expect(page.getByTestId('habit-card-exercise')).toBeVisible()

    // Streak starts at 0
    await expect(page.getByTestId('habit-streak-exercise')).toContainText('0')

    // Complete it
    await page.getByTestId('habit-complete-exercise').click()

    // Streak should now be 1
    await expect(page.getByTestId('habit-streak-exercise')).toContainText('1')
  })

  test('persists session and habits after page reload', async ({ page }) => {
    await clearStorage(page)
    const email = uniqueEmail()
    await signUpAndLogin(page, email)

    // Create a habit
    await page.getByTestId('create-habit-button').click()
    await page.getByTestId('habit-name-input').fill('Read Books')
    await page.getByTestId('habit-save-button').click()
    await expect(page.getByTestId('habit-card-read-books')).toBeVisible()

    // Reload
    await page.reload()

    // Still on dashboard with same habit
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
    await expect(page.getByTestId('habit-card-read-books')).toBeVisible()
  })

  test('logs out and redirects to /login', async ({ page }) => {
    await clearStorage(page)
    const email = uniqueEmail()
    await signUpAndLogin(page, email)

    await page.getByTestId('auth-logout-button').click()
    await page.waitForURL('/login')
    expect(page.url()).toContain('/login')

    // Session should be gone — going to /dashboard redirects to /login
    await page.goto('/dashboard')
    await page.waitForURL('/login', { timeout: 5000 })
  })

  test('loads the cached app shell when offline after the app has been loaded once', async ({ page, context }) => {
    await clearStorage(page)

    // Load the app online first to cache it
    await page.goto('/')
    await page.waitForURL('/login', { timeout: 5000 })
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Go offline
    await context.setOffline(true)

    // Try to navigate to login — should not hard crash
    await page.goto('/login')

    // App shell should still render something (no net::ERR_INTERNET_DISCONNECTED)
    const body = page.locator('body')
    await expect(body).not.toBeEmpty()

    // Restore online
    await context.setOffline(false)
  })
})