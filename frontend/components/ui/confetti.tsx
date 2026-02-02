'use client';

import ConfettiExplosion from 'react-confetti-explosion';

interface ConfettiProps {
  onComplete?: () => void;
}

export default function Confetti({ onComplete }: ConfettiProps) {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <ConfettiExplosion
        force={0.6}
        duration={3000}
        particleCount={250}
        width={1600}
        onComplete={onComplete}
        colors={['#00A2EF', '#1F2937', '#11AAF3', '#374151', '#60A5FA']}
      />
    </div>
  );
}
