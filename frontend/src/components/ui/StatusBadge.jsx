import React from 'react';

export function StatusBadge({ status = 'failed', label, className = '' }) {
  const normalized = (status || '').toLowerCase();

  const badgeConfig = {
    failed: {
      label: label || 'FAILED',
      styles: 'bg-[#7D4047]/15 text-[#7D4047] border-[#7D4047]/30 font-bold',
      dot: 'bg-[#7D4047]'
    },
    diagnosed: {
      label: label || 'DIAGNOSED',
      styles: 'bg-sky-500/15 text-sky-400 border-sky-500/30 font-semibold',
      dot: 'bg-sky-400'
    },
    decided: {
      label: label || 'DECIDED',
      styles: 'bg-[#DDD5CD]/15 text-[#F8F6F2] border-white/10 font-semibold',
      dot: 'bg-white'
    },
    allowed: {
      label: label || 'ALLOWED',
      styles: 'bg-[#4A6B53]/20 text-emerald-400 border-[#4A6B53]/40 font-bold',
      dot: 'bg-emerald-400'
    },
    allow: {
      label: label || 'ALLOWED',
      styles: 'bg-[#4A6B53]/20 text-emerald-400 border-[#4A6B53]/40 font-bold',
      dot: 'bg-emerald-400'
    },
    executed: {
      label: label || 'EXECUTED',
      styles: 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold',
      dot: 'bg-amber-400'
    },
    recovered: {
      label: label || 'VERIFIED RECOVERED',
      styles: 'bg-[#4A6B53]/25 text-emerald-300 border-[#4A6B53]/50 font-extrabold',
      dot: 'bg-emerald-400'
    },
    dry_run: {
      label: label || 'DRY RUN',
      styles: 'bg-white/5 text-[#DDD5CD] border-white/10 font-semibold',
      dot: 'bg-[#DDD5CD]'
    },
    simulated: {
      label: label || 'SIMULATED',
      styles: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 font-bold',
      dot: 'bg-cyan-400'
    },
    execute: {
      label: label || 'LIVE EXECUTE',
      styles: 'bg-[#7D4047] text-white border-[#7D4047] font-bold',
      dot: 'bg-white'
    }
  };

  const config = badgeConfig[normalized] || {
    label: label || status.toUpperCase(),
    styles: 'bg-white/5 text-[#DDD5CD] border-white/10 font-medium',
    dot: 'bg-[#DDD5CD]'
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full
        text-[10px] font-mono uppercase tracking-wider border
        select-none ${config.styles} ${className}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}

export default StatusBadge;
