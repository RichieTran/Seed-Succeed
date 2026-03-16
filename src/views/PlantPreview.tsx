import { useState } from 'react';
import { GrowthStage } from '../types';
import type { PlantColor } from '../types';
import { PlantSVG } from '../components/plant/PlantSVG';
import { STAGE_NAMES, PLANT_COLORS } from '../constants/plants';

const STAGES = [
  { stage: GrowthStage.Seed, points: 2 },
  { stage: GrowthStage.Sprout, points: 9 },
  { stage: GrowthStage.Seedling, points: 24 },
  { stage: GrowthStage.YoungPlant, points: 50 },
  { stage: GrowthStage.Mature, points: 90 },
  { stage: GrowthStage.Flowering, points: 155 },
  { stage: GrowthStage.Tree, points: 220 },
];

const COLORS: PlantColor[] = ['green', 'rose', 'violet', 'amber', 'sky', 'emerald'];

export function PlantPreview({ onClose }: { onClose: () => void }) {
  const [color, setColor] = useState<PlantColor>('green');

  return (
    <div className="flex-1 bg-gradient-to-b from-sky-50 via-green-50/30 to-white overflow-y-auto">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>
        <h2 className="text-sm font-bold text-gray-800">Plant Gallery</h2>
        <div className="w-12" />
      </div>

      {/* Color picker */}
      <div className="flex justify-center gap-3 pt-5 pb-2">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-8 h-8 rounded-full transition-all ${
              color === c ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'
            }`}
            style={{ backgroundColor: PLANT_COLORS[c].primary }}
          />
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 mb-4">Tap a color to preview</p>

      {/* All stages */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 px-4 pb-24 max-w-3xl mx-auto">
        {STAGES.map(({ stage, points }) => (
          <div key={stage} className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <PlantSVG
              stage={stage}
              growthPoints={points}
              color={color}
              size={130}
            />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">
                {STAGE_NAMES[stage]}
              </p>
              <p className="text-xs text-gray-400">
                Stage {stage + 1}/7 &middot; {points} pts
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
