import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Activity, 
  ArrowRight,
  BarChart3,
  Bot
} from 'lucide-react';
import GlassButton from '../ui/GlassButton';
import AnimatedCounter from '../ui/AnimatedCounter';
import StatusBadge from '../ui/StatusBadge';
import { formatDate } from '../../lib/formatters';

export function CommandCenterView({
  metrics,
  activities = [],
  loading = false,
  error = null,
  onRefresh,
  onSelectPayment,
  onNavigate
}) {
  const totalAtRisk = metrics?.total_at_risk || 0;
  const totalRecovered = metrics?.total_recovered || 0;
  const recoveryRate = metrics?.recovery_rate || 0;
  const recoveredCount = metrics?.recovered_payment_count || 0;
  const failedCount = metrics?.failed_payment_count || 0;
  const pendingCount = metrics?.pending_recovery_count || 0;

  const byCause = metrics?.by_root_cause || {};
  const byAction = metrics?.by_action || {};

  return (
    <div className="space-y-8 pt-28 pb-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto z-10 relative text-[#F8F6F2] bg-[#171717]">
      
      {/* Primary Unmissable Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="eyebrow-pill-framer mb-3">
            <Activity className="w-3.5 h-3.5 text-[#7D4047]" />
            <span>AUTONOMOUS OPERATIONS</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#F8F6F2]">
            RECOVERY <span className="font-serif-italic font-normal text-[#7D4047]">COMMAND CENTER</span>
          </h1>
          <p className="mt-2 text-base text-[#DDD5CD] font-normal max-w-2xl leading-relaxed opacity-90">
            Real-time portfolio telemetry, AI diagnosis metrics, and verified revenue settlement.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium text-[#B7B0A8] bg-[#1C1B1A]/72 hover:bg-[#1C1B1A] border border-white/12 transition-all cursor-pointer static-icon"
        >
          <span>Sync Engine</span>
          <RefreshCw className="w-3.5 h-3.5 text-[#B7B0A8] static-icon" />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-[#7D4047]/20 border border-[#7D4047]/40 text-rose-200 text-sm font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={onRefresh} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* Primary KPI Grid - Translucent Glass Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-6 rounded-3xl bg-[#1E1D1C]/80 border border-white/12 backdrop-blur-xl shadow-xl lift-hover font-mono">
          <span className="text-[10px] font-bold uppercase text-[#6F6A64] block tracking-wider">Gross Volume At Risk</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#F8F6F2] mt-2">
            <AnimatedCounter value={totalAtRisk} type="currencyShort" />
          </div>
          <span className="text-xs text-[#DDD5CD] mt-1 block opacity-70">Live Monitored</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#1E1D1C]/80 border border-emerald-500/30 backdrop-blur-xl shadow-xl lift-hover font-mono">
          <span className="text-[10px] font-bold uppercase text-emerald-400 block tracking-wider">Total Recovered</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-2">
            <AnimatedCounter value={totalRecovered} type="currencyShort" />
          </div>
          <span className="text-xs text-emerald-400/80 mt-1 block">{recoveredCount} Settled Payments</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#1E1D1C]/80 border border-sky-500/30 backdrop-blur-xl shadow-xl lift-hover font-mono">
          <span className="text-[10px] font-bold uppercase text-sky-400 block tracking-wider">Recovery Conversion</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-sky-400 mt-2">
            <AnimatedCounter value={recoveryRate} type="percent" />
          </div>
          <span className="text-xs text-sky-400/80 mt-1 block">Deterministic Pipeline</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#1E1D1C]/80 border border-[#7D4047]/30 backdrop-blur-xl shadow-xl lift-hover font-mono">
          <span className="text-[10px] font-bold uppercase text-[#7D4047] block tracking-wider">Failed Queue</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#F8F6F2] mt-2">
            <AnimatedCounter value={failedCount} type="number" />
          </div>
          <span className="text-xs text-[#7D4047] mt-1 block">{pendingCount} Active in Recovery</span>
        </div>

      </div>

      {/* Analytics Breakdown Matrix - Translucent Glass */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* By Root Cause */}
        <div className="p-6 rounded-3xl bg-[#1E1D1C]/80 border border-white/12 backdrop-blur-xl shadow-xl lift-hover font-mono">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-sm text-[#F8F6F2]">AI Diagnosis Cause Distribution</h3>
            </div>
            <span className="text-[10px] text-[#6F6A64] font-bold uppercase">Advisory Analytics</span>
          </div>

          <div className="mt-4 space-y-3">
            {Object.keys(byCause).length > 0 ? (
              Object.entries(byCause).map(([cause, val]) => {
                const count = typeof val === 'object' && val !== null ? (val.payment_count ?? val.count ?? val.attempts ?? 0) : Number(val || 0);
                const total = Object.values(byCause).reduce((sum, v) => sum + (typeof v === 'object' && v !== null ? (v.payment_count ?? v.count ?? v.attempts ?? 0) : Number(v || 0)), 0) || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={cause} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#DDD5CD] uppercase font-semibold">{cause.replace(/_/g, ' ')}</span>
                      <span className="text-white font-bold">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-sky-400 rounded-full transition-all duration-700" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-[#6F6A64]">
                No diagnostic distribution data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* By Action */}
        <div className="p-6 rounded-3xl bg-[#1E1D1C]/80 border border-white/12 backdrop-blur-xl shadow-xl lift-hover font-mono">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#7D4047]" />
              <h3 className="font-bold text-sm text-[#F8F6F2]">Recovery Action Dispatches</h3>
            </div>
            <span className="text-[10px] text-[#6F6A64] font-bold uppercase">Executed Playbooks</span>
          </div>

          <div className="mt-4 space-y-3">
            {Object.keys(byAction).length > 0 ? (
              Object.entries(byAction).map(([action, val]) => {
                const count = typeof val === 'object' && val !== null ? (val.attempts ?? val.executed ?? val.count ?? 0) : Number(val || 0);
                const total = Object.values(byAction).reduce((sum, v) => sum + (typeof v === 'object' && v !== null ? (v.attempts ?? v.executed ?? v.count ?? 0) : Number(v || 0)), 0) || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={action} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#DDD5CD] uppercase font-semibold">{action.replace(/_/g, ' ')}</span>
                      <span className="text-white font-bold">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#7D4047] rounded-full transition-all duration-700" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-[#6F6A64]">
                No recovery execution events recorded yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Activity Stream */}
      <div className="p-6 rounded-3xl bg-[#1E1D1C]/80 border border-white/12 backdrop-blur-xl shadow-xl lift-hover">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 font-mono">
          <h3 className="font-bold text-sm text-[#F8F6F2]">Live Flight Recorder Stream</h3>
          <button 
            onClick={() => onNavigate('audit')}
            className="text-xs text-[#7D4047] font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 divide-y divide-white/5">
          {activities.slice(0, 8).map((evt) => (
            <div
              key={evt.event_id}
              onClick={() => evt.payment_id && evt.payment_id !== 'unmatched' && onSelectPayment(evt.payment_id)}
              className="py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-white/[0.08] px-2 rounded-xl transition-colors cursor-pointer group text-xs font-mono"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#F8F6F2] group-hover:text-[#7D4047] transition-colors">
                  {evt.payment_id}
                </span>
                <StatusBadge status={evt.outcome || evt.stage} />
                {evt.action && (
                  <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {evt.action}
                  </span>
                )}
              </div>

              <div className="text-right text-[#6F6A64] text-[11px]">
                {formatDate(evt.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default CommandCenterView;
