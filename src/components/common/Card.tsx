import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'red' | 'blue' | 'green' | 'amber' | 'none';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  onClick
}) => {
  let glowClass = '';
  if (glow === 'red') glowClass = 'shadow-glow-red border-red-500/30';
  if (glow === 'blue') glowClass = 'shadow-glow-blue border-blue-500/30';
  if (glow === 'green') glowClass = 'shadow-glow-green border-emerald-500/30';
  if (glow === 'amber') glowClass = 'shadow-[0_0_20px_-5px_rgba(245,165,36,0.35)] border-amber-500/30';

  return (
    <div
      onClick={onClick}
      className={`rounded-[12px] bg-white dark:bg-[#111a2b] border border-[#e2e8f0] dark:border-[#1f2b42] shadow-sm dark:shadow-card transition-all duration-200 ${glowClass} ${className}`}
    >
      {children}
    </div>
  );
};
