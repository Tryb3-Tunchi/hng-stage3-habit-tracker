import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Habit Tracker</h1>
          <p className="text-slate-500 mt-2">Welcome back</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}