import { motion } from 'framer-motion';
import { GrowthStage } from '../../types';
import type { PlantColor } from '../../types';
import { PLANT_COLORS } from '../../constants/plants';
import { getStageProgress } from '../../utils/growth';

interface PlantSVGProps {
  stage: GrowthStage;
  growthPoints: number;
  color: PlantColor;
  size?: number;
  animate?: boolean;
}

export function PlantSVG({ stage, growthPoints, color, size = 160, animate = true }: PlantSVGProps) {
  const colors = PLANT_COLORS[color];
  const progress = getStageProgress(growthPoints);

  return (
    <motion.svg
      viewBox="0 0 200 280"
      width={size}
      height={size * 1.4}
      initial={animate ? { scale: 0.9, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
    >
      {/* Pot */}
      <path
        d="M60 230 L65 270 L135 270 L140 230 Z"
        fill="#C2885C"
        stroke="#A0714A"
        strokeWidth="2"
      />
      <path
        d="M55 222 L55 234 L145 234 L145 222 Z"
        fill="#D4976A"
        rx="4"
      />
      <ellipse cx="100" cy="228" rx="42" ry="4" fill="#8B6543" opacity="0.3" />

      {/* Soil */}
      <ellipse cx="100" cy="228" rx="38" ry="6" fill="#5C3D2E" />

      {/* Plant based on stage */}
      <g className={animate ? 'animate-gentle-sway' : ''}>
        {stage === GrowthStage.Seed && <SeedStage progress={progress} colors={colors} />}
        {stage === GrowthStage.Sprout && <SproutStage progress={progress} colors={colors} />}
        {stage === GrowthStage.Seedling && <SeedlingStage progress={progress} colors={colors} />}
        {stage === GrowthStage.YoungPlant && <YoungPlantStage progress={progress} colors={colors} />}
        {stage === GrowthStage.Mature && <MaturePlantStage progress={progress} colors={colors} />}
        {stage === GrowthStage.Flowering && <FloweringStage progress={progress} colors={colors} />}
        {stage === GrowthStage.Tree && <TreeStage progress={progress} colors={colors} />}
      </g>
    </motion.svg>
  );
}

interface StageProps {
  progress: number;
  colors: { primary: string; light: string; dark: string };
}

function SeedStage({ progress, colors }: StageProps) {
  const y = 222 - progress * 4;
  return (
    <g>
      <ellipse cx="100" cy={y} rx={6 + progress * 2} ry={4 + progress} fill={colors.dark} />
      {progress > 0.5 && (
        <motion.path
          d={`M100 ${y} Q102 ${y - 6} 100 ${y - 8 - progress * 4}`}
          stroke={colors.primary}
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8 }}
        />
      )}
    </g>
  );
}

function SproutStage({ progress, colors }: StageProps) {
  const stemHeight = 20 + progress * 15;
  const stemTop = 222 - stemHeight;
  return (
    <g>
      <motion.path
        d={`M100 222 Q100 ${stemTop + 5} 100 ${stemTop}`}
        stroke={colors.primary}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6 }}
      />
      {/* Two small leaves */}
      <motion.path
        d={`M100 ${stemTop + 5} Q90 ${stemTop - 5} 85 ${stemTop + 2}`}
        fill={colors.primary}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
      />
      <motion.path
        d={`M100 ${stemTop + 5} Q110 ${stemTop - 5} 115 ${stemTop + 2}`}
        fill={colors.light}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4 }}
      />
    </g>
  );
}

function SeedlingStage({ progress, colors }: StageProps) {
  const stemHeight = 40 + progress * 20;
  const stemTop = 222 - stemHeight;
  return (
    <g>
      <path
        d={`M100 222 Q98 ${stemTop + 20} 100 ${stemTop}`}
        stroke={colors.dark}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Leaves at intervals */}
      <path d={`M100 ${stemTop + 30} Q85 ${stemTop + 15} 78 ${stemTop + 25}`} fill={colors.primary} />
      <path d={`M100 ${stemTop + 30} Q115 ${stemTop + 15} 122 ${stemTop + 25}`} fill={colors.light} />
      <path d={`M100 ${stemTop + 10} Q88 ${stemTop - 5} 82 ${stemTop + 5}`} fill={colors.primary} />
      <path d={`M100 ${stemTop + 10} Q112 ${stemTop - 5} 118 ${stemTop + 5}`} fill={colors.light} />
      {/* Top leaf cluster */}
      <ellipse cx="100" cy={stemTop - 2} rx={8 + progress * 4} ry={6 + progress * 3} fill={colors.primary} />
    </g>
  );
}

function YoungPlantStage({ progress, colors }: StageProps) {
  const stemHeight = 65 + progress * 20;
  const stemTop = 222 - stemHeight;
  return (
    <g>
      <path
        d={`M100 222 Q97 ${stemTop + 40} 100 ${stemTop}`}
        stroke={colors.dark}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Multiple leaf pairs */}
      {[0, 1, 2, 3].map((i) => {
        const y = stemTop + 10 + i * 18;
        const spread = 18 + (3 - i) * 4;
        return (
          <g key={i}>
            <path
              d={`M100 ${y} Q${100 - spread} ${y - 12} ${100 - spread - 5} ${y - 2}`}
              fill={i % 2 === 0 ? colors.primary : colors.light}
            />
            <path
              d={`M100 ${y} Q${100 + spread} ${y - 12} ${100 + spread + 5} ${y - 2}`}
              fill={i % 2 === 0 ? colors.light : colors.primary}
            />
          </g>
        );
      })}
      {/* Top crown */}
      <ellipse cx="100" cy={stemTop - 3} rx={12 + progress * 5} ry={10 + progress * 3} fill={colors.primary} />
      <ellipse cx="96" cy={stemTop - 6} rx={8} ry={7} fill={colors.light} opacity="0.6" />
    </g>
  );
}

function MaturePlantStage({ progress, colors }: StageProps) {
  const stemTop = 222 - 100 - progress * 15;
  return (
    <g>
      {/* Thick stem */}
      <path
        d={`M100 222 Q96 ${stemTop + 50} 100 ${stemTop + 10}`}
        stroke={colors.dark}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Bushy leaves */}
      {[0, 1, 2, 3, 4].map((i) => {
        const y = stemTop + 15 + i * 20;
        const spread = 22 + (4 - i) * 5 + progress * 3;
        return (
          <g key={i}>
            <ellipse
              cx={100 - spread * 0.7}
              cy={y}
              rx={spread * 0.5}
              ry={8}
              fill={i % 2 === 0 ? colors.primary : colors.light}
              transform={`rotate(-15 ${100 - spread * 0.7} ${y})`}
            />
            <ellipse
              cx={100 + spread * 0.7}
              cy={y}
              rx={spread * 0.5}
              ry={8}
              fill={i % 2 === 0 ? colors.light : colors.primary}
              transform={`rotate(15 ${100 + spread * 0.7} ${y})`}
            />
          </g>
        );
      })}
      {/* Crown */}
      <ellipse cx="100" cy={stemTop} rx={20 + progress * 5} ry={15 + progress * 3} fill={colors.primary} />
      <ellipse cx="95" cy={stemTop - 3} rx={12} ry={10} fill={colors.light} opacity="0.5" />
    </g>
  );
}

function FloweringStage({ progress, colors }: StageProps) {
  const stemTop = 222 - 120 - progress * 10;
  return (
    <g>
      {/* Thick stem */}
      <path
        d={`M100 222 Q95 ${stemTop + 60} 100 ${stemTop + 15}`}
        stroke={colors.dark}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      {/* Bushy leaves */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const y = stemTop + 20 + i * 18;
        const spread = 25 + (5 - i) * 4;
        return (
          <g key={i}>
            <ellipse
              cx={100 - spread * 0.7}
              cy={y}
              rx={spread * 0.45}
              ry={7}
              fill={colors.primary}
              transform={`rotate(-20 ${100 - spread * 0.7} ${y})`}
            />
            <ellipse
              cx={100 + spread * 0.7}
              cy={y}
              rx={spread * 0.45}
              ry={7}
              fill={colors.light}
              transform={`rotate(20 ${100 + spread * 0.7} ${y})`}
            />
          </g>
        );
      })}
      {/* Crown */}
      <ellipse cx="100" cy={stemTop + 5} rx={25} ry={18} fill={colors.primary} />
      {/* Flowers */}
      {[
        { cx: 85, cy: stemTop - 5 },
        { cx: 115, cy: stemTop },
        { cx: 100, cy: stemTop - 12 },
        { cx: 75, cy: stemTop + 15 },
        { cx: 125, cy: stemTop + 18 },
      ].map((f, i) => (
        <g key={i}>
          {[0, 1, 2, 3, 4].map((p) => (
            <ellipse
              key={p}
              cx={f.cx + Math.cos((p * 72 * Math.PI) / 180) * 5}
              cy={f.cy + Math.sin((p * 72 * Math.PI) / 180) * 5}
              rx="4"
              ry="4"
              fill={i % 2 === 0 ? '#fbbf24' : '#fb923c'}
              opacity={0.7 + progress * 0.3}
            />
          ))}
          <circle cx={f.cx} cy={f.cy} r="3" fill="#fef3c7" />
        </g>
      ))}
    </g>
  );
}

function TreeStage({ progress, colors }: StageProps) {
  const trunkBase = 222;
  const trunkTop = 80;
  return (
    <g>
      {/* Trunk */}
      <path
        d={`M95 ${trunkBase} Q93 ${trunkTop + 40} 97 ${trunkTop + 20} L97 ${trunkTop + 10}`}
        stroke="#8B6543"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M105 ${trunkBase} Q107 ${trunkTop + 40} 103 ${trunkTop + 20} L103 ${trunkTop + 10}`}
        stroke="#A0714A"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      {/* Branches */}
      <path d={`M98 ${trunkTop + 50} Q75 ${trunkTop + 30} 65 ${trunkTop + 40}`} stroke="#8B6543" strokeWidth="3" fill="none" />
      <path d={`M102 ${trunkTop + 50} Q125 ${trunkTop + 30} 135 ${trunkTop + 40}`} stroke="#8B6543" strokeWidth="3" fill="none" />
      {/* Canopy layers */}
      <ellipse cx="100" cy={trunkTop + 15} rx="45" ry="25" fill={colors.dark} />
      <ellipse cx="80" cy={trunkTop + 5} rx="30" ry="20" fill={colors.primary} />
      <ellipse cx="120" cy={trunkTop + 5} rx="30" ry="20" fill={colors.primary} />
      <ellipse cx="100" cy={trunkTop - 10} rx="35" ry="22" fill={colors.primary} />
      <ellipse cx="90" cy={trunkTop - 15} rx="20" ry="15" fill={colors.light} opacity="0.6" />
      <ellipse cx="115" cy={trunkTop - 5} rx="18" ry="12" fill={colors.light} opacity="0.4" />
      {/* Fruit/flowers on tree */}
      {[
        { cx: 75, cy: trunkTop + 10 },
        { cx: 125, cy: trunkTop + 10 },
        { cx: 90, cy: trunkTop - 5 },
        { cx: 110, cy: trunkTop - 8 },
        { cx: 100, cy: trunkTop + 20 },
      ].map((f, i) => (
        <circle
          key={i}
          cx={f.cx}
          cy={f.cy}
          r={3 + progress}
          fill={i % 2 === 0 ? '#ef4444' : '#f59e0b'}
          opacity={0.8}
        />
      ))}
    </g>
  );
}
