import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers3, 
  Play, 
  RefreshCw, 
  AlertTriangle, 
  Clock
} from 'lucide-react';
import GlassButton from '../ui/GlassButton';
import StatusBadge from '../ui/StatusBadge';
import { api } from '../../services/api';
import { formatRupeesShort, formatDate } from '../../lib/formatters';

export function BatchRecoveryView({ onSelectPayment }) {
  const [mode, setMode] = useState('dry_run'); // 'dry_run' | 'execute'
  const [batchResult, setBatchResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.getBatches(20);
      setHistory(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch batch history');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRunBatch = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.runBatch(mode);
      setBatchResult(res);
      await fetchHistory();
    } catch (err) {
      setError(err.message || 'Batch run failed');
    } finally {
      setBusy(false);
    }
  };

  const triggerExecution = () => {
    if (mode === 'execute') {
      setConfirmModal(true);
    } else {
      handleRunBatch();
    }
  };

  return (
    <div className="space-y-8 pt-28 pb-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto z-10 relative text-[#F4F1EC] bg-[#11100F]">
      
      {/* Primary Unmissable Headline Hierarchy */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="eyebrow-pill-framer mb-3">
            <Layers3 className="w-3.5 h-3.5 text-[#7D4047]" />
            <span>PORTFOLIO AUTOMATION</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#F4F4F4]">
            BATCH RECOVERY <span className="font-serif-italic font-normal text-[#7D4047]">ENGINE</span>
          </h1>
          <p className="mt-2 text-base text-[#B7B0A8] max-w-2xl font-normal">
            Orchestrate recovery across high-volume payment failures. Evaluate policy guardrails with simulated dry runs or live automated dispatch.
          </p>
        </div>

        {/* STATIC Secondary Utility Control - NO ROTATION / ANIMATION */}
        <button
          onClick={fetchHistory}
          disabled={historyLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium text-[#B7B0A8] bg-[#1C1B1A]/72 hover:bg-[#1C1B1A] border border-white/12 transition-all cursor-pointer static-icon"
        >
          <span>Sync Runs</span>
          <RefreshCw className="w-3.5 h-3.5 text-[#B7B0A8] static-icon" />
        </button>
      </div>

      {/* Main Execution Panel - Translucent Glass */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#1C1B1A]/72 border border-white/11 shadow-2xl backdrop-blur-xl lift-hover">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.03.5] border border-white/10 w-fit font-mono text-xs">
            <button
              onClick={() => setMode('dry_run')}
              className={`px-5 py-2.5 rounded-lg font-bold transition-all cursor-pointer ${
                mode === 'dry_run'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'text-[#B7B0A8] hover:text-white'
              }`}
            >
              DRY RUN (Simulated)
            </button>

            <button
              onClick={() => setMode('execute')}
              className={`px-5 py-2.5 rounded-lg font-bold transition-all cursor-pointer ${
                mode === 'execute'
                  ? 'bg-[#7D4047] text-white shadow-md'
                  : 'text-[#B7B0A8] hover:text-white'
              }`}
            >
              EXECUTE (Live Gated)
            </button>
          </div>

          {/* Description & Action */}
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-xs font-mono text-[#B7B0A8] max-w-md font-normal leading-relaxed">
              {mode === 'dry_run'
                ? 'Dry run scans payment records, computes AI diagnoses, and evaluates policy guardrails without dispatching external touches.'
                : 'Execute mode triggers Razorpay test link generation and customer touchpoints ONLY when policy decision is allow.'}
            </p>

            <GlassButton
              variant={mode === 'execute' ? 'danger' : 'primary'}
              size="lg"
              disabled={busy}
              onClick={triggerExecution}
              icon={Play}
            >
              {busy ? 'Orchestrating...' : mode === 'execute' ? 'Execute Batch' : 'Run Dry Run'}
            </GlassButton>
          </div>

        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-[#7D4047]/20 border border-[#7D4047]/40 text-rose-200 text-xs font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Latest Run Results */}
      {batchResult && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#B7B0A8]">Run ID:</span>
              <span className="font-bold text-white opacity-70">{batchResult.batch_id}</span>
              <StatusBadge status={batchResult.mode} />
            </div>
          </div>

          {/* Summary Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: 'Scanned', value: batchResult.total_scanned, tone: 'text-white' },
              { label: 'Eligible', value: batchResult.eligible, tone: 'text-[#00A9C7]' },
              { label: 'Blocked', value: batchResult.blocked, tone: 'text-[#7D4047]' },
              { label: 'Diagnosed', value: batchResult.diagnosed, tone: 'text-[#B7B0A8]' },
              { label: 'Allowed', value: batchResult.actions_allowed, tone: 'text-[#16B879]' },
              { label: 'Executed', value: batchResult.executed, tone: 'text-amber-400' },
              { label: 'At Risk', value: formatRupeesShort(batchResult.total_at_risk), tone: 'text-white' },
              { label: 'Recovered', value: formatRupeesShort(batchResult.total_recovered), tone: 'text-[#16B879]' }
            ].map((m) => (
              <div key={m.label} className="p-4 rounded-xl bg-[#1C1B1A]/72 border border-white/10">
                <span className="text-[10px] font-mono font-bold uppercase text-[#817B75]">{m.label}</span>
                <p className={`text-lg font-extrabold font-mono mt-1 ${m.tone}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Outcomes Table */}
          <div className="rounded-2xl bg-[#1C1B1A]/72 border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <h3 className="font-mono font-bold text-xs text-white">
                Per-Transaction Batch Outcomes ({batchResult.results?.length || 0})
              </h3>
              <span className="text-xs font-mono text-[#817B75]">Click row to inspect</span>
            </div>

            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#141312] text-[10px] font-mono font-bold uppercase text-[#B7B0A8] sticky top-0 z-20 border-b border-white/10 shadow-sm">
                  <tr>
                    <th className="py-3.5 px-4 bg-[#141312] sticky top-0 z-20 border-b border-white/10 font-bold whitespace-nowrap align-middle">Payment ID</th>
                    <th className="py-3.5 px-4 bg-[#141312] sticky top-0 z-20 border-b border-white/10 font-bold whitespace-nowrap align-middle">Original Status</th>
                    <th className="py-3.5 px-4 bg-[#141312] sticky top-0 z-20 border-b border-white/10 font-bold whitespace-nowrap align-middle">Eligibility</th>
                    <th className="py-3.5 px-4 bg-[#141312] sticky top-0 z-20 border-b border-white/10 font-bold whitespace-nowrap align-middle">Root Cause</th>
                    <th className="py-3.5 px-4 bg-[#141312] sticky top-0 z-20 border-b border-white/10 font-bold whitespace-nowrap align-middle">Decision / Action</th>
                    <th className="py-3.5 px-4 bg-[#141312] sticky top-0 z-20 border-b border-white/10 font-bold whitespace-nowrap align-middle">Policy Result</th>
                    <th className="py-3.5 px-4 bg-[#141312] sticky top-0 z-20 border-b border-white/10 font-bold whitespace-nowrap align-middle">Simulation / Execution</th>
                    <th className="py-3.5 px-4 bg-[#141312] sticky top-0 z-20 border-b border-white/10 font-bold whitespace-nowrap align-middle">Reasoning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono bg-[#1C1B1A]/40">
                  {batchResult.results?.map((r) => (
                    <tr
                      key={r.payment_id}
                      onClick={() => onSelectPayment(r.payment_id)}
                      className="hover:bg-white/[0.06] cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-white opacity-90 align-middle whitespace-nowrap">
                        {r.payment_id}
                      </td>
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <StatusBadge status={r.original_status} />
                      </td>
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <StatusBadge status={r.eligibility} />
                      </td>
                      <td className="py-3.5 px-4 text-[#B7B0A8] align-middle whitespace-nowrap">
                        {r.root_cause || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#7D4047] uppercase align-middle whitespace-nowrap">
                        {r.candidate_action || r.recommended_action || '—'}
                      </td>
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <StatusBadge status={r.policy_decision} />
                      </td>
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <StatusBadge status={r.execution_status} />
                      </td>
                      <td className="py-3.5 px-4 text-[#817B75] max-w-xs truncate align-middle">
                        {r.reason || r.policy_reason || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Historical Ledger - Translucent Container */}
      <div>
        <h3 className="text-sm font-bold font-mono text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#7D4047]" />
          <span>Historical Batch Execution Ledger</span>
        </h3>

        <div className="space-y-3">
          {historyLoading ? (
            <div className="py-12 text-center text-xs text-[#B7B0A8] font-mono">
              Reading historical runs...
            </div>
          ) : history.length > 0 ? (
            history.map((h) => (
              <div
                key={h.batch_id}
                className="p-5 rounded-2xl bg-[#141312]/52 border border-white/10 flex flex-wrap items-center justify-between gap-4 lift-hover"
              >
                <div>
                  <div className="flex items-center gap-2.5 font-mono">
                    <span className="font-bold text-sm text-white opacity-70">{h.batch_id}</span>
                    <StatusBadge status={h.mode} />
                  </div>
                  <p className="mt-1 text-xs text-[#817B75] font-mono">
                    {formatDate(h.started_at)} · Scanned: {h.total_scanned} · Eligible: {h.eligible} · Executed: {h.executed}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right sm:text-left font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-[#817B75] font-bold">At Risk</span>
                    <p className="text-xs font-bold text-white">{formatRupeesShort(h.total_at_risk)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#16B879] font-bold">Recovered</span>
                    <p className="text-xs font-bold text-[#16B879]">{formatRupeesShort(h.total_recovered)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-[#817B75] font-mono">
              No historical batch runs recorded in database yet.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#1C1B1A] rounded-2xl p-6 border border-white/16 shadow-2xl space-y-4 text-white font-mono"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7D4047]/20 text-[#7D4047] flex items-center justify-center border border-[#7D4047]/30">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-base font-bold text-white">
                Confirm Portfolio-Wide Execution?
              </h4>
              <p className="text-xs text-[#B7B0A8] mt-1 leading-relaxed">
                This will trigger live recovery execution across all eligible payments. Policy guardrails will strictly block any transactions exceeding retry caps or customer opt-outs.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => setConfirmModal(false)}
              >
                Cancel
              </GlassButton>
              <GlassButton
                variant="danger"
                size="sm"
                onClick={() => {
                  setConfirmModal(false);
                  handleRunBatch();
                }}
              >
                Confirm & Execute
              </GlassButton>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

export default BatchRecoveryView;
