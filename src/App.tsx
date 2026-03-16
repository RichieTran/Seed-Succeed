import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { View } from './types';
import { HabitProvider } from './context/HabitContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { GardenView } from './views/GardenView';
import { DailyView } from './views/DailyView';
import { HabitDetailView } from './views/HabitDetailView';
import { SettingsView } from './views/SettingsView';
import { PlantPreview } from './views/PlantPreview';

function AppContent() {
  const [view, setView] = useState<View>({ name: 'garden' });
  const [showPreview, setShowPreview] = useState(false);

  const handleSelectHabit = (habitId: string) => {
    setView({ name: 'detail', habitId });
  };

  const handleBack = () => {
    setView({ name: 'garden' });
  };

  if (showPreview) {
    return (
      <div className="flex flex-col min-h-dvh bg-white">
        <PlantPreview onClose={() => setShowPreview(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      {view.name !== 'detail' && <Header onShowGallery={() => setShowPreview(true)} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={view.name === 'detail' ? `detail-${view.habitId}` : view.name}
          initial={{ opacity: 0, x: view.name === 'detail' ? 20 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: view.name === 'detail' ? 20 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {view.name === 'garden' && <GardenView onSelectHabit={handleSelectHabit} />}
          {view.name === 'daily' && <DailyView onSelectHabit={handleSelectHabit} />}
          {view.name === 'detail' && (
            <HabitDetailView habitId={view.habitId} onBack={handleBack} />
          )}
          {view.name === 'settings' && <SettingsView />}
        </motion.div>
      </AnimatePresence>

      {view.name !== 'detail' && (
        <BottomNav currentView={view} onNavigate={setView} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <HabitProvider>
      <AppContent />
    </HabitProvider>
  );
}
