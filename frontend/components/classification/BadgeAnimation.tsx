'use client';

import { useEffect, useState } from 'react';
import { Industry } from '@/lib/storage';

interface BadgeAnimationProps {
  type: 'icp' | 'not_icp' | Industry;
  onComplete: () => void;
}

export default function BadgeAnimation({ type, onComplete }: BadgeAnimationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [rotation] = useState(() => Math.random() > 0.5 ? 12 : -12);

  useEffect(() => {
    // Generate particles for dissolve effect
    const particleCount = 20;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
      delay: Math.random() * 100,
    }));
    setParticles(newParticles);

    // Trigger completion after animation
    const timer = setTimeout(onComplete, 512);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Determine if it's ICP mode or industry mode
  const isIcp = type === 'icp';
  const isNotIcp = type === 'not_icp';
  const isIndustry = !isIcp && !isNotIcp;

  // Position offset - 20% closer than before (57.6 instead of 72)
  let baseOffset = 0;
  if (isIcp) {
    baseOffset = 58;
  } else if (isNotIcp) {
    baseOffset = -58;
  } else {
    // For industry, randomly position left or right
    baseOffset = Math.random() > 0.5 ? 58 : -58;
  }

  const offsetX = baseOffset + (Math.random() - 0.5) * 30;
  const offsetY = (Math.random() - 0.5) * 20;

  // Get badge text and color
  let badgeText = '';
  let backgroundColor = '#1F2937';
  let borderColor = '#374151';
  let shadowColor = 'rgba(75, 85, 99, 0.42)';

  if (isIcp) {
    badgeText = '✓ ICP';
    backgroundColor = '#00A2EF';
    borderColor = '#11AAF3';
    shadowColor = 'rgba(31, 183, 255, 0.48)';
  } else if (isNotIcp) {
    badgeText = '✗ Not ICP';
  } else {
    badgeText = type as string;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px)`,
      }}
    >
      {/* Badge */}
      <div
        className="badge-pop"
        style={{
          transform: `rotate(${rotation}deg)`,
          animation: 'badge-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        <div
          className="relative font-bold text-white"
          style={{
            padding: '9.6px 19.2px',
            fontSize: '16.8px',
            backgroundColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '10px',
            boxShadow: `inset 0 1px 3px 3px ${shadowColor}`,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {badgeText}
        </div>
      </div>

      {/* Particles for dissolve effect */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle-dissolve absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor,
            animation: `particle-dissolve 0.384s ease-out forwards`,
            animationDelay: `${256 + particle.delay}ms`,
            '--particle-x': `${particle.x}px`,
            '--particle-y': `${particle.y}px`,
          } as React.CSSProperties}
        />
      ))}

      <style jsx>{`
        @keyframes badge-pop {
          0% {
            transform: scale(0) rotate(${rotation}deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.08) rotate(${rotation}deg);
          }
          70% {
            transform: scale(0.97) rotate(${rotation}deg);
          }
          100% {
            transform: scale(1) rotate(${rotation}deg);
            opacity: 1;
          }
        }

        @keyframes particle-dissolve {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--particle-x), var(--particle-y)) scale(0);
            opacity: 0;
          }
        }

        .badge-pop {
          animation: badge-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .particle-dissolve {
          animation: particle-dissolve 0.384s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
