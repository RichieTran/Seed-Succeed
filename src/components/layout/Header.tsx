import { useHabits } from '../../context/HabitContext';

interface HeaderProps {
  onShowGallery?: () => void;
}

export function Header({ onShowGallery }: HeaderProps) {
  const { getTodayProgress } = useHabits();
  const { done, total } = getTodayProgress();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-5 sticky top-0 z-40">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌱</span>
          <h1 className="text-xl font-bold text-gray-800">Seed & Succeed</h1>
        </div>
        <div className="flex items-center gap-3">
          {onShowGallery && (
            <button
              onClick={onShowGallery}
              className="text-sm font-medium text-gray-400 hover:text-green-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-green-50"
              title="Plant Gallery"
            >
              🌿 Gallery
            </button>
          )}
          {total > 0 && (
            <div className="flex items-center gap-2.5">
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-green-600">{done}</span>
                <span>/{total} today</span>
              </div>
              <div className="w-9 h-9 relative">
                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
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
      </div>
    </header>
  );
}
