import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { formatRupees, formatDate, getStatusConfig } from '../../lib/formatters';
import { StatusBadge } from '../ui/StatusBadge';
import { 
  X, 
  BrainCircuit, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PaymentDetailsModal({ paymentId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!paymentId) return;

    async function fetchDetails() {
      setLoading(true);
      try {
        const res = await api.getPaymentDetails(paymentId);
        setData(res);
      } catch (err) {
        console.error('Failed to fetch payment details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [paymentId]);

  if (!paymentId) return null;

  const payment = data?.payment;
  const diag = data?.latest_diagnosis;
  const exec = data?.latest_execution;
  const timeline = data?.timeline || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl bg-aurora-surface border-l border-white/10 h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">Loading payment details from SQLite...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-rose-400 font-mono text-xs space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto" />
              <p>Failed to load payment: {error}</p>
            </div>
          ) : payment ? (
            <>
              {/* Top Payment Summary Header */}
              <div className="space-y-3 border-b border-white/5 pb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                    Payment Lifecycle Record
                  </span>
                  <StatusBadge status={payment.status} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white font-mono tracking-tight">
                      {payment.payment_id}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Customer ID: <span className="text-slate-200 font-mono">{payment.customer_id}</span>
                    </p>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-2xl font-extrabold text-white block">
                      {formatRupees(payment.amount)}
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase">
                      Method: {payment.payment_method}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs font-mono">
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-500 text-[10px] block">FAILURE CODE</span>
                    <span className="text-rose-400 font-bold">{payment.failure_code}</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-500 text-[10px] block">RETRY COUNT</span>
                    <span className="text-slate-200 font-bold">{payment.retry_count} / 3</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-500 text-[10px] block">OPTED OUT</span>
                    <span className={payment.opted_out ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {payment.opted_out ? 'YES' : 'NO'}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-500 text-[10px] block">CREATED AT</span>
                    <span className="text-slate-300 text-[11px]">{formatDate(payment.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* AI Diagnosis Panel */}
              <div className="p-4 rounded-2xl bg-violet-950/20 border border-violet-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-violet-300 font-semibold">
                  <BrainCircuit className="w-4 h-4 text-violet-400" />
                  <span>Claude AI Advisory Diagnosis</span>
                </div>

                {diag ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-400">Root Cause:</span>
                      <span className="text-white font-bold uppercase">{diag.root_cause}</span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-400">Recommended Action:</span>
                      <span className="text-cyan-400 font-bold uppercase">{diag.recommended_action || 'N/A'}</span>
                    </div>
                    <p className="text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 text-[11px] leading-relaxed">
                      "{diag.reason || payment.failure_message}"
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-mono">No AI diagnosis recorded for this payment yet.</p>
                )}
              </div>

              {/* Execution Details if available */}
              {exec && (
                <div className="p-4 rounded-2xl bg-aurora-card border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-semibold">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span>Safe Recovery Execution</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-500 text-[10px] block">ACTION</span>
                      <span className="text-cyan-400 font-bold uppercase">{exec.action}</span>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-500 text-[10px] block">OUTCOME</span>
                      <span className="text-emerald-400 font-bold uppercase">{exec.outcome}</span>
                    </div>
                  </div>

                  {exec.reference_id && (
                    <div className="text-xs font-mono text-slate-400">
                      Reference ID: <span className="text-white font-bold">{exec.reference_id}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Vertical Animated Event Timeline */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Audit Lifecycle Timeline</span>
                </h3>

                {timeline.length === 0 ? (
                  <p className="text-xs font-mono text-slate-500">No events logged.</p>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                    {timeline.map((evt, idx) => (
                      <div key={evt.event_id || idx} className="relative group">
                        {/* Dot */}
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-aurora-bg border-2 border-violet-400 group-hover:bg-violet-400 transition-colors" />

                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs space-y-1">
                          <div className="flex items-center justify-between font-mono">
                            <span className="font-bold text-white uppercase">{evt.stage}</span>
                            <span className="text-[10px] text-slate-500">{formatDate(evt.timestamp)}</span>
                          </div>
                          {evt.action && (
                            <div className="font-mono text-cyan-400 text-[11px]">
                              Action: {evt.action} ({evt.outcome || 'executed'})
                            </div>
                          )}
                          <p className="text-slate-400 text-[11px]">
                            {evt.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
