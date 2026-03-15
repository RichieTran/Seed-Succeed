import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface CompletionButtonProps {
  completed: boolean;
  onToggle: () => { pointsEarned: number; newStage: boolean; multiplier: number } | null;
  color?: string;
}

export function CompletionButton({ completed, onToggle, color = '#22c55e' }: CompletionButtonProps) {
  const [feedback, setFeedback] = useState<{ points: number; multiplier: number } | null>(null);

  const handleClick = () => {
    const result = onToggle();
    if (result) {
      setFeedback({ points: result.pointsEarned, multiplier: result.multiplier });
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.9 }}
        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
          completed
            ? 'border-transparent'
            : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
        style={completed ? { backgroundColor: color, borderColor: color } : {}}
      >
        <AnimatePresence mode="wait">
          {completed ? (
            <motion.svg
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.svg>
          ) : (
            <motion.div
              key="empty"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap pointer-events-none"
            style={{ color }}
          >
            +{feedback.points}pts
            {feedback.multiplier > 1 && (
              <span className="text-amber-500 ml-0.5">{feedback.multiplier}x</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
