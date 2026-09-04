import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { formatRupees, formatPercent } from '../../lib/formatters';
import { TrendingUp, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

export function RevenuePreview({ metrics }) {
  const recoveredPaise = metrics?.total_recovered ?? 0;
  const atRiskPaise = metrics?.total_at_risk ?? 0;
  const rate = metrics?.recovery_rate ?? 0;
  const count = metrics?.recovered_payment_count ?? 0;

  return (
    <GlassCard glow="violet" className="w-full max-w-lg mx-auto shadow-2xl relative group">
      {/* Floating Badge */}
      <div className="absolute -top-3 right-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[11px] font-mono uppercase tracking-wider font-bold px-3 py-0.5 rounded-full shadow-lg shadow-violet-600/30 flex items-center gap-1">
        <Zap className="w-3 h-3 fill-current" />
        <span>Verified Recovery</span>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-mono tracking-wider uppercase text-slate-400 font-semibold block">
                Recovered Revenue
              </span>
              <span className="text-[11px] text-slate-500">Verified Razorpay Settlement</span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{formatPercent(rate)}</span>
          </div>
        </div>

        {/* Large Amount */}
        <div>
          <div className="text-4xl font-extrabold tracking-tight text-white font-mono">
            {formatRupees(recoveredPaise)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {count} payment{count !== 1 ? 's' : ''} recovered from {formatRupees(atRiskPaise)} at risk
          </p>
        </div>

        {/* Mini Status Breakdown */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5 text-xs">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-slate-400 text-[11px] block font-mono">AT RISK REVENUE</span>
            <span className="font-semibold text-slate-200 text-sm font-mono mt-0.5 block">
              {formatRupees(atRiskPaise)}
            </span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-slate-400 text-[11px] block font-mono">RECOVERY RATE</span>
            <span className="font-semibold text-emerald-400 text-sm font-mono mt-0.5 block">
              {formatPercent(rate)}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
