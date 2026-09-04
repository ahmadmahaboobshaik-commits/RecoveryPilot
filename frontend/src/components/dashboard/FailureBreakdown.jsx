import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { formatRupeesShort } from '../../lib/formatters';
import { AlertCircle } from 'lucide-react';

export function FailureBreakdown({ metrics }) {
  const byCause = metrics?.by_root_cause || {};
  const causes = Object.keys(byCause);

  const getLabel = (code) => {
    switch (code.toLowerCase()) {
      case 'insufficient_funds': return 'Insufficient Funds';
      case 'bank_timeout': return 'Bank Timeout';
      case 'card_expired': return 'Expired Card';
      case '3ds_auth_failed': return '3DS Auth Failed';
      case 'gateway_error': return 'Gateway Error';
      case 'checkout_abandoned': return 'Checkout Abandoned';
      default: return code.replace('_', ' ').toUpperCase();
    }
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Why Revenue Is At Risk</h3>
          <p className="text-xs text-slate-400">Failure breakdown by gateway root cause</p>
        </div>
        <AlertCircle className="w-4 h-4 text-amber-400" />
      </div>

      <div className="space-y-3 pt-2">
        {causes.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-mono">
            No failure cause data available yet.
          </div>
        ) : (
          causes.map((cause) => {
            const data = byCause[cause];
            const atRisk = data.at_risk || 0;
            const recovered = data.recovered || 0;
            const total = metrics?.total_at_risk || 1;
            const percentAtRisk = Math.min(100, Math.round((atRisk / total) * 100));

            return (
              <div key={cause} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-semibold text-slate-200">{getLabel(cause)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{formatRupeesShort(atRisk)} at risk</span>
                    {recovered > 0 && (
                      <span className="text-emerald-400 font-bold">({formatRupeesShort(recovered)} recovered)</span>
                    )}
                  </div>
                </div>

                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentAtRisk}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}
