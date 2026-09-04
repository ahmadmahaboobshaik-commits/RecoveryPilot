import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export function GlowButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className,
  onClick,
  ...props
}) {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 hover:scale-[1.02] active:scale-[0.98] border border-white/10',
    secondary: 'bg-aurora-card/80 hover:bg-aurora-card-hover text-slate-200 border border-white/10 hover:border-violet-500/30 hover:text-white',
    warning: 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-lg shadow-amber-600/25 hover:shadow-amber-600/40 hover:scale-[1.02] active:scale-[0.98] border border-white/10',
    ghost: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm font-semibold rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base font-bold rounded-xl gap-2.5'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none select-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 text-current" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
