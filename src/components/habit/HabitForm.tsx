import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlantColor, Frequency, Habit } from '../../types';
import { PLANT_COLORS, EMOJI_OPTIONS } from '../../constants/plants';

interface HabitFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    emoji: string;
    color: PlantColor;
    frequency: Frequency;
    description?: string;
    customDays?: number[];
  }) => void;
  initialData?: Habit;
}

const COLORS: PlantColor[] = ['green', 'rose', 'violet', 'amber', 'sky', 'emerald'];
const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'custom', label: 'Custom' },
];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HabitForm({ open, onClose, onSubmit, initialData }: HabitFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [emoji, setEmoji] = useState(initialData?.emoji || '🧘');
  const [color, setColor] = useState<PlantColor>(initialData?.color || 'green');
  const [frequency, setFrequency] = useState<Frequency>(initialData?.frequency || 'daily');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      emoji,
      color,
      frequency,
      description: description.trim() || undefined,
      customDays: frequency === 'custom' ? customDays : undefined,
    });
    setName('');
    setDescription('');
    onClose();
  };

  const toggleDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full mx-3 sm:mx-auto sm:max-w-2xl max-h-[95vh] overflow-y-auto"
            style={{ padding: '2.5rem 3rem 3rem' }}
          >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-800">
                  {initialData ? 'Edit Habit' : 'New Habit'}
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 -mr-2 rounded-full hover:bg-gray-100">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-7">
                {/* Emoji picker */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Icon</label>
                  <div className="flex flex-wrap gap-2.5">
                    {EMOJI_OPTIONS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setEmoji(e)}
                        className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                          emoji === e
                            ? 'bg-green-50 ring-2 ring-green-400 scale-110'
                            : 'hover:bg-gray-50 bg-gray-50/50'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Habit Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Meditate for 10 minutes"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition text-gray-800 text-base"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Description (optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Why this habit matters to you"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition text-gray-800 text-base"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Plant Color</label>
                  <div className="flex gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-5 h-5 rounded-full transition-all ${
                          color === c ? 'ring-2 ring-offset-2 scale-125' : 'hover:scale-110'
                        }`}
                        style={{
                          backgroundColor: PLANT_COLORS[c].primary,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Frequency</label>
                  <div className="flex gap-2.5 flex-wrap">
                    {FREQUENCIES.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFrequency(f.value)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          frequency === f.value
                            ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom days */}
                {frequency === 'custom' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="flex gap-2.5">
                      {DAY_LABELS.map((label, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleDay(i)}
                          className={`w-10 h-10 rounded-full text-xs font-medium transition-all ${
                            customDays.includes(i)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full py-4 rounded-2xl bg-green-500 text-white text-lg font-semibold hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-4"
                >
                  {initialData ? 'Save Changes' : 'Plant This Habit 🌱'}
                </button>
              </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
