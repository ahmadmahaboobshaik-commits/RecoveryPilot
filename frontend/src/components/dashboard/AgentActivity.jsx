import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';
import { formatRelativeTime } from '../../lib/formatters';
import { Activity, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AgentActivity({ activities = [], loading = false }) {
  return (
    <GlassCard className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-bold text-white tracking-tight">Agent Activity Feed</h3>
        </div>
        <span className="text-xs font-mono text-slate-400">GET /api/recovery/activity</span>
      </div>

      {/* Activity Item List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-mono">
            No recovery events logged yet. Run a recovery cycle to generate events.
          </div>
        ) : (
          <AnimatePresence>
            {activities.map((item, index) => (
              <motion.div
                key={item.event_id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="p-3 rounded-xl bg-aurora-surface/60 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between text-xs gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white tracking-tight truncate">
                      {item.payment_id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 py-0.5 rounded bg-white/5">
                      {item.stage}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] truncate max-w-sm">
                    {item.reason || 'Recovery lifecycle event logged'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={item.outcome || item.stage} />
                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </GlassCard>
  );
}
