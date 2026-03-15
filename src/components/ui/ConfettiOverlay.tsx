import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  velocity: number;
}

interface ConfettiOverlayProps {
  active: boolean;
  onComplete?: () => void;
}

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#f43f5e'];

export function ConfettiOverlay({ active, onComplete }: ConfettiOverlayProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 40,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 6,
        angle: Math.random() * 360,
        velocity: 2 + Math.random() * 4,
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const dx = Math.cos(rad) * p.velocity * 80;
            const dy = Math.sin(rad) * p.velocity * 60 - 100;
            return (
              <motion.div
                key={p.id}
                initial={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  left: `calc(${p.x}% + ${dx}px)`,
                  top: `calc(${p.y}% + ${dy + 200}px)`,
                  opacity: 0,
                  scale: 0.5,
                  rotate: Math.random() * 720 - 360,
                }}
                transition={{ duration: 1.5 + Math.random() * 0.5, ease: 'easeOut' }}
                className="absolute rounded-sm"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
