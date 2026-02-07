'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-24 h-24',
};

export function LoreweaverLogo({ size = 'sm', className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizes[size], className)}
    >
      {/* Outer web ring */}
      <polygon
        points="32,2 58,17 58,47 32,62 6,47 6,17"
        stroke="#8b7ec8"
        strokeWidth="0.8"
        fill="none"
        opacity="0.3"
      />
      {/* Inner web ring */}
      <polygon
        points="32,12 48,21 48,43 32,52 16,43 16,21"
        stroke="#8b7ec8"
        strokeWidth="0.6"
        fill="none"
        opacity="0.4"
      />
      {/* Core web ring */}
      <polygon
        points="32,22 40,27 40,37 32,42 24,37 24,27"
        stroke="#8b7ec8"
        strokeWidth="0.5"
        fill="none"
        opacity="0.5"
      />
      {/* Radial threads */}
      <line x1="32" y1="2" x2="32" y2="62" stroke="#8b7ec8" strokeWidth="0.5" opacity="0.25" />
      <line x1="6" y1="17" x2="58" y2="47" stroke="#8b7ec8" strokeWidth="0.5" opacity="0.25" />
      <line x1="58" y1="17" x2="6" y2="47" stroke="#8b7ec8" strokeWidth="0.5" opacity="0.25" />

      {/* Spider body */}
      <ellipse cx="32" cy="30" rx="3.5" ry="4.5" fill="#8b7ec8" />
      <circle cx="32" cy="25" r="2.5" fill="#8b7ec8" />

      {/* Spider legs - left */}
      <path d="M29 26 Q22 20 18 16" stroke="#8b7ec8" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M29 28 Q20 25 14 23" stroke="#8b7ec8" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M29 31 Q20 32 14 35" stroke="#8b7ec8" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M29 33 Q22 38 18 43" stroke="#8b7ec8" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* Spider legs - right */}
      <path d="M35 26 Q42 20 46 16" stroke="#8b7ec8" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M35 28 Q44 25 50 23" stroke="#8b7ec8" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M35 31 Q44 32 50 35" stroke="#8b7ec8" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M35 33 Q42 38 46 43" stroke="#8b7ec8" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* Spider eyes */}
      <circle cx="31" cy="24" r="0.8" fill="#e2e0ef" />
      <circle cx="33" cy="24" r="0.8" fill="#e2e0ef" />

      {/* Silk thread descending */}
      <line x1="32" y1="34" x2="32" y2="52" stroke="#8b7ec8" strokeWidth="0.4" opacity="0.5" strokeDasharray="1.5 1" />
    </svg>
  );
}
