import { useHabits } from '../../context/HabitContext';

export function Header() {
  const { getTodayProgress } = useHabits();
  const { done, total } = getTodayProgress();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <h1 className="text-lg font-bold text-gray-800">Seed & Succeed</h1>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-green-600">{done}</span>
              <span>/{total} today</span>
            </div>
            <div className="w-8 h-8 relative">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(done / Math.max(total, 1)) * 88} 88`}
                  className="transition-all duration-500"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
