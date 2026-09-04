import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function GlassCard({
  children,
  className,
  glow = 'none',
  hoverable = false,
  onClick,
  ...props
}) {
  const glowStyles = {
    none: 'border-white/10',
    violet: 'border-indigo-500/30 hover:border-indigo-500/50',
    cyan: 'border-sky-500/30 hover:border-sky-500/50',
    emerald: 'border-emerald-500/30 hover:border-emerald-500/50',
    amber: 'border-amber-500/30 hover:border-amber-500/50',
    rose: 'border-[#7D4047]/40 hover:border-[#7D4047]/60'
  };

  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'rounded-2xl p-6 relative overflow-hidden bg-[#1E1D1C] border border-white/10 backdrop-blur-xl text-[#F8F6F2]',
          hoverable && 'lift-hover cursor-pointer',
          glowStyles[glow],
          className
        )
      )}
      {...props}
    >
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}

export default GlassCard;
