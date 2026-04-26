export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="min-h-screen flex flex-col items-center justify-center bg-indigo-600"
    >
      <div className="text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Habit Tracker
        </h1>
        <p className="text-indigo-200 mt-3 text-lg">
          Build habits that last
        </p>
        <div className="mt-8 flex justify-center gap-1">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}