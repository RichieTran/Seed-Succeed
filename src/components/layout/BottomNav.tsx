import type { View } from '../../types';

interface BottomNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  const tabs = [
    { name: 'garden' as const, label: 'Garden', icon: GardenIcon },
    { name: 'daily' as const, label: 'Today', icon: TodayIcon },
    { name: 'settings' as const, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-t border-gray-100 px-4 py-2 sticky bottom-0 z-40">
      <div className="max-w-lg mx-auto flex justify-around">
        {tabs.map((tab) => {
          const isActive = currentView.name === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => onNavigate({ name: tab.name })}
              className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-lg transition-colors ${
                isActive
                  ? 'text-green-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon active={isActive} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function GardenIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12" />
      <path d="M12 12C12 12 7 9 4 12C1 15 4 18 12 12Z" />
      <path d="M12 12C12 12 17 9 20 12C23 15 20 18 12 12Z" />
      <path d="M12 12C12 12 9 7 12 4C15 7 12 12 12 12Z" />
    </svg>
  );
}

function TodayIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <path d="M9 16l2 2 4-4" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
