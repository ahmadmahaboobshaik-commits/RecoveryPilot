import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatRupees } from '../lib/formatters';
import { BrainCircuit, Filter, ShieldCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function Decisions({ onSelectPayment }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPolicy, setFilterPolicy] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.getPayments({ limit: 100 });
        setPayments(res.payments || []);
      } catch (err) {
        console.error('Failed to load decisions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = payments.filter((p) => {
    if (!filterPolicy) return true;
    if (filterPolicy === 'blocked' && (p.opted_out || p.retry_count >= 3)) return true;
    if (filterPolicy === 'allowed' && (!p.opted_out && p.retry_count < 3)) return true;
    return true;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              AI & Policy Decision Explorer
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Observe how Claude AI advisory recommendations are evaluated against authoritative policy guardrails.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5 text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
          <button
            onClick={() => setFilterPolicy('')}
            className={`px-3 py-1 rounded-lg ${!filterPolicy ? 'bg-violet-600 text-white font-bold' : 'text-slate-400'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterPolicy('allowed')}
            className={`px-3 py-1 rounded-lg ${filterPolicy === 'allowed' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Allowed
          </button>
          <button
            onClick={() => setFilterPolicy('blocked')}
            className={`px-3 py-1 rounded-lg ${filterPolicy === 'blocked' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Blocked
          </button>
        </div>
      </div>

      {/* Decision Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-xs font-mono text-slate-500">
            Loading AI decisions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-xs font-mono text-slate-500">
            No decision records matching criteria.
          </div>
        ) : (
          filtered.map((p) => {
            const isBlocked = p.opted_out || p.retry_count >= 3;
            const policyDecision = isBlocked ? 'block' : 'allow';
            const policyReason = p.opted_out
              ? 'Customer opted out of recovery'
              : p.retry_count >= 3
              ? 'Maximum touches (3) reached'
              : 'Action permitted by policy guardrails';

            return (
              <div
                key={p.payment_id}
                onClick={() => onSelectPayment && onSelectPayment(p.payment_id)}
                className="glass-card p-5 rounded-2xl border border-white/10 space-y-4 hover:border-violet-500/30 cursor-pointer transition-all"
              >
                {/* Top ID & Amount */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <span className="font-bold text-sm text-white font-mono">{p.payment_id}</span>
                    <span className="text-[11px] text-slate-400 block font-mono">Customer: {p.customer_id}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-white block">{formatRupees(p.amount)}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Failure Cause:</span>
                    <span className="text-rose-400 font-bold uppercase">{p.failure_code}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Candidate Action:</span>
                    <span className="text-cyan-400 font-bold uppercase">{p.latest_action || 'payment_link'}</span>
                  </div>
                </div>

                {/* Policy Decision Evaluation */}
                <div className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${isBlocked ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'}`}>
                  <div className="flex items-center justify-between font-bold uppercase">
                    <span>Policy Evaluation:</span>
                    <span>{policyDecision}</span>
                  </div>
                  <p className="text-[11px] opacity-90">{policyReason}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
