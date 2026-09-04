import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function LoadingSkeleton({ className, ...props }) {
  return (
    <div
      className={twMerge(
        clsx(
          'animate-pulse rounded-xl bg-white/5 border border-white/5',
          className
        )
      )}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <LoadingSkeleton className="h-4 w-28" />
        <LoadingSkeleton className="h-8 w-8 rounded-lg" />
      </div>
      <LoadingSkeleton className="h-9 w-44" />
      <div className="flex items-center gap-2">
        <LoadingSkeleton className="h-4 w-16" />
        <LoadingSkeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/5">
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-32" />
        <LoadingSkeleton className="h-3 w-20" />
      </div>
      <LoadingSkeleton className="h-4 w-24" />
      <LoadingSkeleton className="h-6 w-20 rounded-full" />
      <LoadingSkeleton className="h-4 w-28" />
    </div>
  );
}
