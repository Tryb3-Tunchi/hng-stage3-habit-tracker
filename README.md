# Habit Tracker PWA

A mobile-first Progressive Web App for tracking daily habits, built with Next.js 14 App Router, TypeScript, Tailwind CSS, and localStorage persistence.

---

## Project Overview

Users can sign up, log in, create habits, mark them complete daily, view streaks, edit and delete habits, and install the app as a PWA. All data is stored locally in `localStorage` — no backend or external auth service.

---

## Setup Instructions

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd habit-tracker

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium
```

---

## Run Instructions

```bash
# Development server
npm run dev       # http://localhost:3000

# Production build
npm run build
npm run start
```

---

## Test Instructions

```bash
# Unit tests + coverage (vitest)
npm run test:unit

# Integration/component tests (vitest + RTL)
npm run test:integration

# End-to-end tests (Playwright — requires dev server running)
npm run test:e2e

# All tests
npm test
```

Coverage report is generated in `coverage/` after running `test:unit`.

---

## Local Persistence Structure

All data lives in `localStorage` under three fixed keys:

| Key | Type | Description |
|-----|------|-------------|
| `habit-tracker-users` | `User[]` JSON | All registered users |
| `habit-tracker-session` | `Session \| null` JSON | Currently active session |
| `habit-tracker-habits` | `Habit[]` JSON | All habits across all users |

### User shape
```ts
{ id: string; email: string; password: string; createdAt: string }
```

### Session shape
```ts
{ userId: string; email: string }
```

### Habit shape
```ts
{
  id: string; userId: string; name: string;
  description: string; frequency: 'daily';
  createdAt: string; completions: string[] // YYYY-MM-DD
}
```

Habits are filtered by `userId` on the dashboard so each user only sees their own.

---

## PWA Support

- `public/manifest.json` — declares the app as installable with name, icons, start URL, display mode
- `public/sw.js` — service worker using network-first with cache fallback strategy
- SW is registered in `src/app/layout.tsx` via `useEffect` on the client
- On first load, the SW caches the app shell routes
- On subsequent offline visits, the cached shell renders without a hard crash

---

## Trade-offs and Limitations

- **No real auth** — passwords stored in plaintext in localStorage. Intentional per spec.
- **No encryption** — localStorage is not secure. Acceptable for this local-only stage.
- **Single device** — no sync across devices since there's no backend.
- **No router library** — Next.js App Router handles routing natively.
- **Frequency locked to 'daily'** — spec only requires daily for this stage.
- **No offline form submission** — forms require network for navigation, but shell loads offline.

---

## Test File Map

| Test file | What it verifies |
|-----------|-----------------|
| `tests/unit/slug.test.ts` | `getHabitSlug()` — lowercasing, hyphenation, trimming, special char removal |
| `tests/unit/validators.test.ts` | `validateHabitName()` — empty, too long, valid/trimmed input |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak()` — empty, no today, consecutive, duplicates, gaps |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion()` — add, remove, no mutation, no duplicates |
| `tests/integration/auth-flow.test.tsx` | Signup creates session, duplicate email error, login stores session, wrong creds error |
| `tests/integration/habit-form.test.tsx` | Validation error, create habit, edit preserves immutable fields, delete confirmation, streak toggle |
| `tests/e2e/app.spec.ts` | Full user flows: splash, redirects, auth, CRUD, persistence, logout, offline shell |

---

## Required Folder Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx               ← / splash + redirect
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── dashboard/page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── habits/
│   │   ├── HabitCard.tsx
│   │   └── HabitForm.tsx
│   └── shared/
│       └── SplashScreen.tsx
├── lib/
│   ├── slug.ts
│   ├── validators.ts
│   ├── streaks.ts
│   ├── habits.ts
│   └── storage.ts
└── types/
    ├── auth.ts
    └── habit.ts
tests/
├── unit/
│   ├── slug.test.ts
│   ├── validators.test.ts
│   ├── streaks.test.ts
│   └── habits.test.ts
├── integration/
│   ├── auth-flow.test.tsx
│   └── habit-form.test.tsx
└── e2e/
    └── app.spec.ts
public/
├── manifest.json
├── sw.js
└── icons/
    ├── icon-192.png
    └── icon-512.png
```