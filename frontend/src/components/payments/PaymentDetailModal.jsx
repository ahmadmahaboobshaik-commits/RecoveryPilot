import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bot, 
  BrainCircuit, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  FileSearch,
  Copy,
  Check
} from 'lucide-react';
import LiquidGlass from '../ui/LiquidGlass';
import GlassButton from '../ui/GlassButton';
import StatusBadge from '../ui/StatusBadge';
import { api } from '../../services/api';
import { formatRupees, formatDate } from '../../lib/formatters';

export function PaymentDetailModal({ paymentId, onClose, onRefreshData }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [confirmExecute, setConfirmExecute] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchDetails = async () => {
    if (!paymentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPaymentDetails(paymentId);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch payment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [paymentId]);

  const handleCopyId = () => {
    if (!paymentId) return;
    navigator.clipboard.writeText(paymentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunDiagnose = async () => {
    setActionBusy(true);
    try {
      await api.diagnosePayment(paymentId);
      await fetchDetails();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert(`Diagnosis error: ${err.message}`);
    } finally {
      setActionBusy(false);
    }
  };

  const handleRunEvaluate = async () => {
    setActionBusy(true);
    try {
      await api.evaluatePayment(paymentId);
      await fetchDetails();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert(`Evaluation error: ${err.message}`);
    } finally {
      setActionBusy(false);
    }
  };

  const handleRunExecute = async () => {
    setActionBusy(true);
    setConfirmExecute(false);
    try {
      await api.executePayment(paymentId);
      await fetchDetails();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert(`Execution error: ${err.message}`);
    } finally {
      setActionBusy(false);
    }
  };

  if (!paymentId) return null;

  const p = data?.payment;
  const d = data?.latest_diagnosis;
  const exec = data?.latest_execution;
  const timeline = data?.timeline || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white h-full shadow-2xl z-10 overflow-y-auto flex flex-col border-l border-slate-200 text-[#0F172A]"
        >
          {/* Header */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-[#0F172A]">{paymentId}</span>
                <button 
                  onClick={handleCopyId}
                  className="p-1 rounded-md text-slate-400 hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Customer: {p?.customer_id || '—'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {p && <StatusBadge status={p.status} />}
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#0F172A] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6 flex-1">
            {loading ? (
              <div className="py-24 text-center text-sm text-[#B7B0A8] font-mono">
                <RefreshCw className="w-6 h-6 mx-auto text-[#7D4047] mb-2 static-icon" />
                Loading recovery telemetry...
              </div>
            ) : error ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                {error}
              </div>
            ) : p ? (
              <>
                {/* Amount & Status Card */}
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Transaction Value</span>
                      <div className="text-3xl font-extrabold font-display text-[#0F172A] mt-1">
                        {formatRupees(p.amount)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-right sm:text-left">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Payment Method</span>
                        <p className="text-xs font-bold text-[#0F172A] capitalize mt-0.5">{p.payment_method}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Retry Touches</span>
                        <p className="text-xs font-bold text-[#0F172A] mt-0.5">{p.retry_count} / 3 cap</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold">Failure Code:</span>
                      <p className="font-mono font-bold text-rose-600 mt-0.5">{p.failure_code || 'UNKNOWN'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">Opt-Out Status:</span>
                      <p className="font-bold text-[#0F172A] mt-0.5">{p.opted_out ? 'Yes (Opted Out)' : 'No (Eligible)'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">Created At:</span>
                      <p className="text-[#0F172A] font-medium mt-0.5">{formatDate(p.created_at)}</p>
                    </div>
                  </div>

                  {p.failure_message && (
                    <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-mono">
                      {p.failure_message}
                    </div>
                  )}
                </div>

                {/* AI Advisory Diagnosis */}
                <div className="p-6 rounded-3xl bg-violet-50/50 border border-violet-200">
                  <div className="flex items-center justify-between pb-3 border-b border-violet-100">
                    <div className="flex items-center gap-2 text-violet-800 font-bold font-display text-sm">
                      <Bot className="w-4 h-4 text-violet-600" />
                      <span>AI Diagnosis</span>
                      <span className="text-[10px] font-mono font-bold text-violet-700 px-2 py-0.5 bg-violet-100 rounded-full">
                        Advisory Only
                      </span>
                    </div>
                    {d && <StatusBadge status="diagnosed" label="Persisted" />}
                  </div>

                  {d ? (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-white border border-violet-100">
                          <span className="text-[10px] font-mono font-bold text-violet-600 uppercase">Root Cause</span>
                          <p className="text-xs font-bold text-[#0F172A] capitalize mt-0.5">{d.root_cause}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-violet-100">
                          <span className="text-[10px] font-mono font-bold text-violet-600 uppercase">Recommendation</span>
                          <p className="text-xs font-bold text-cyan-700 uppercase font-mono mt-0.5">{d.recommended_action || 'None'}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-violet-100 text-xs text-slate-700 leading-relaxed font-light">
                        {d.reason || 'AI diagnosis recorded.'}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-slate-500">
                      No diagnosis record logged for this payment yet. Click Diagnose below to trigger advisory AI analysis.
                    </div>
                  )}
                </div>

                {/* Execution Telemetry */}
                {exec && (
                  <div className="p-6 rounded-3xl bg-cyan-50/50 border border-cyan-200">
                    <div className="flex items-center justify-between pb-3 border-b border-cyan-100">
                      <div className="flex items-center gap-2 text-cyan-800 font-bold font-display text-sm">
                        <Zap className="w-4 h-4 text-cyan-600" />
                        <span>Execution Telemetry</span>
                      </div>
                      <StatusBadge status={exec.outcome || 'executed'} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold">Action:</span>
                        <p className="font-mono font-bold text-[#0F172A] uppercase mt-0.5">{exec.action || '—'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold">Reference ID:</span>
                        <p className="font-mono text-cyan-700 font-bold mt-0.5 truncate">{exec.reference_id || '—'}</p>
                      </div>
                    </div>

                    {exec.reason && (
                      <p className="mt-3 text-xs text-slate-700 bg-white p-3 rounded-xl border border-cyan-100">
                        {exec.reason}
                      </p>
                    )}
                  </div>
                )}

                {/* Chronological Event Timeline */}
                <div>
                  <h3 className="text-sm font-bold font-display text-[#0F172A] mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-600" />
                    <span>Illuminated Recovery Timeline</span>
                  </h3>

                  <div className="space-y-3">
                    {timeline.length > 0 ? (
                      timeline.map((evt) => (
                        <div
                          key={evt.event_id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold uppercase text-[#0F172A]">
                              {evt.stage}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {formatDate(evt.timestamp)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <StatusBadge status={evt.outcome || evt.stage} />
                            {evt.action && (
                              <span className="text-[11px] font-mono text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200 font-semibold">
                                Action: {evt.action}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600">
                            {evt.reason || 'Lifecycle event recorded.'}
                          </p>

                          {evt.reference_id && (
                            <p className="text-[10px] font-mono text-slate-400 truncate">
                              Ref: {evt.reference_id}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No recovery events recorded in timeline yet.
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Drawer Actions Footer */}
          <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-xl p-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
            <GlassButton
              variant="secondary"
              size="sm"
              disabled={actionBusy || loading}
              onClick={handleRunDiagnose}
              icon={Bot}
            >
              Diagnose
            </GlassButton>

            <GlassButton
              variant="secondary"
              size="sm"
              disabled={actionBusy || loading}
              onClick={handleRunEvaluate}
              icon={FileSearch}
            >
              Evaluate Pipeline
            </GlassButton>

            <GlassButton
              variant="primary"
              size="sm"
              disabled={actionBusy || loading}
              onClick={() => setConfirmExecute(true)}
              icon={Play}
            >
              Execute Recovery
            </GlassButton>
          </div>

          {/* Confirmation Modal */}
          {confirmExecute && (
            <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div>
                  <h4 className="text-lg font-bold font-display text-[#0F172A]">
                    Confirm Recovery Execution
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    This will run policy engine verification on payment <span className="font-mono font-bold text-[#0F172A]">{paymentId}</span>. If allowed, it will execute recovery (e.g. generate a Razorpay test payment link).
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmExecute(false)}
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={handleRunExecute}
                  >
                    Execute Safely
                  </GlassButton>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default PaymentDetailModal;
