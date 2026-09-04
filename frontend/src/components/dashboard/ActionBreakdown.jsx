import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { formatRupeesShort, formatPercent } from '../../lib/formatters';
import { Target } from 'lucide-react';

export function ActionBreakdown({ metrics }) {
  const byAction = metrics?.by_action || {};
  const actions = Object.keys(byAction);

  const getActionLabel = (act) => {
    switch (act) {
      case 'payment_link': return 'Payment Link';
      case 'reminder': return 'Customer Reminder';
      case 'retry': return 'Automated Retry';
      case 'wait': return 'Cooldown Wait';
      case 'stop': return 'Policy Blocked';
      default: return act.toUpperCase();
    }
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Recovery Actions Performance</h3>
          <p className="text-xs text-slate-400 font-mono">Metrics by candidate playbook action</p>
        </div>
        <Target className="w-4 h-4 text-cyan-400" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider">
              <th className="pb-2">Action</th>
              <th className="pb-2 text-right">Attempts</th>
              <th className="pb-2 text-right">Executed</th>
              <th className="pb-2 text-right">Recovered</th>
              <th className="pb-2 text-right">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {actions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-slate-500">
                  No action metrics recorded yet.
                </td>
              </tr>
            ) : (
              actions.map((act) => {
                const item = byAction[act];
                return (
                  <tr key={act} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 font-semibold text-slate-200">
                      {getActionLabel(act)}
                    </td>
                    <td className="py-2.5 text-right text-slate-400">
                      {item.attempts || 0}
                    </td>
                    <td className="py-2.5 text-right text-cyan-400 font-semibold">
                      {item.executed || 0}
                    </td>
                    <td className="py-2.5 text-right text-emerald-400 font-semibold">
                      {formatRupeesShort(item.revenue_recovered || 0)}
                    </td>
                    <td className="py-2.5 text-right text-slate-200">
                      {formatPercent(item.recovery_rate || 0)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
