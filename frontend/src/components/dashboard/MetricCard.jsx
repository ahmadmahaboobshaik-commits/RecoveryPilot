import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { clsx } from 'clsx';

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  glow = 'none',
  isDominant = false
}) {
  return (
    <GlassCard 
      glow={glow} 
      className={clsx(
        'flex flex-col justify-between space-y-4 relative overflow-hidden',
        isDominant && 'md:col-span-2 lg:col-span-2 border-violet-500/30 bg-gradient-to-br from-violet-950/20 via-aurora-card to-aurora-surface'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono tracking-wider uppercase font-semibold text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={clsx(
            'p-2 rounded-xl border',
            isDominant 
              ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' 
              : 'bg-white/5 border-white/5 text-slate-400'
          )}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        <div className={clsx(
          'font-extrabold tracking-tight text-white font-mono',
          isDominant ? 'text-4xl sm:text-5xl text-gradient-aurora' : 'text-2xl sm:text-3xl'
        )}>
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-2 text-xs">
            {trend && (
              <span className={clsx(
                'font-mono font-semibold px-1.5 py-0.5 rounded text-[11px]',
                trendPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
              )}>
                {trend}
              </span>
            )}
            {subtitle && (
              <span className="text-slate-400 text-xs">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
