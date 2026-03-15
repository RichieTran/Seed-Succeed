import { useHabits } from '../../context/HabitContext';
import { PlantPot } from './PlantPot';

interface GardenGridProps {
  onSelectHabit: (habitId: string) => void;
}

export function GardenGrid({ onSelectHabit }: GardenGridProps) {
  const { habits, getPlantState, getStreakInfo } = useHabits();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
      {habits.map((habit, i) => {
        const plantState = getPlantState(habit.id);
        const streakInfo = getStreakInfo(habit.id);
        return (
          <PlantPot
            key={habit.id}
            habit={habit}
            plantState={plantState}
            streak={streakInfo.current}
            onClick={() => onSelectHabit(habit.id)}
            index={i}
          />
        );
      })}
    </div>
  );
}
