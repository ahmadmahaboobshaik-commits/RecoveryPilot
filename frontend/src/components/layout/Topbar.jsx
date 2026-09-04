import React from 'react';
import { Activity, Play, RefreshCw, Zap } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';

export function Topbar({
  title = 'Command Center',
  backendStatus = 'ok',
  onRunBatchClick,
  onRefresh
}) {
  return (
    <header className="h-16 border-b border-white/5 bg-aurora-surface/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white tracking-tight">
          {title}
        </h1>
        <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
          v1.0 Phase 7 API
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Backend System Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-white/5 text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${backendStatus === 'ok' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className={backendStatus === 'ok' ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
            {backendStatus === 'ok' ? 'SYSTEM ACTIVE' : 'CONNECTING...'}
          </span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Run Batch Action Button */}
        {onRunBatchClick && (
          <GlowButton
            variant="primary"
            size="sm"
            icon={Play}
            onClick={onRunBatchClick}
          >
            Run Recovery Cycle
          </GlowButton>
        )}
      </div>
    </header>
  );
}
