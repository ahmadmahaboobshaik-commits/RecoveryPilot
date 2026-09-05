import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  Bot, 
  ShieldCheck, 
  Zap, 
  Play, 
  FileSearch, 
  AlertTriangle,
  Search
} from 'lucide-react';
import GlassButton from '../ui/GlassButton';
import StatusBadge from '../ui/StatusBadge';
import { api } from '../../services/api';

export function DecisionWorkbenchView({ onSelectPayment }) {
  const [paymentId, setPaymentId] = useState('pay_demo_execute_001');
  const [result, setResult] = useState(null);
  const [webhookResult, setWebhookResult] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);

  const runOperation = async (type) => {
    if (!paymentId.trim()) {
      setError('Please provide a valid Payment ID first.');
      return;
    }
    setBusy(type);
    setError(null);
    try {
      const cleanId = paymentId.trim();
      let res;
      if (type === 'diagnose') {
        res = await api.diagnosePayment(cleanId);
      } else if (type === 'evaluate') {
        res = await api.evaluatePayment(cleanId);
      } else if (type === 'execute') {
        res = await api.executePayment(cleanId);
      }
      setResult({ type, data: res });
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setBusy('');
    }
  };

  const handleResetDemo = async (targetId = 'pay_demo_execute_001') => {
    setBusy('reset');
    setError(null);
    try {
      await api.resetDemo();
      setPaymentId(targetId);
      setResult(null);
      setWebhookResult(null);
      setToast(`Demo payments reset cleanly in SQLite. Ready for presentation.`);
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setError(err.message || 'Demo reset failed');
    } finally {
      setBusy('');
    }
  };

  const d = result?.data?.diagnosis;
  const decision = result?.data?.decision;
  const policy = result?.data?.policy;
  const exec = result?.data?.execution;

  return (
    <div className="space-y-8 pt-28 pb-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto z-10 relative text-[#F8F6F2] bg-[#171717]">
      
      {/* Primary Unmissable Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="eyebrow-pill-framer mb-3">
            <BrainCircuit className="w-3.5 h-3.5 text-[#7D4047]" />
            <span>DECISION OPERATIONS</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#F8F6F2]">
            DECISION <span className="font-serif-italic font-normal text-[#7D4047]">WORKBENCH</span>
          </h1>
          <p className="mt-2 text-base text-[#DDD5CD] font-normal max-w-2xl leading-relaxed opacity-90">
            Inspect how AI advises, the Decision Engine maps deterministically, and the Policy Engine exercises authoritative guardrails.
          </p>
        </div>

        {/* Quick Reset Demo State Action */}
        <button
          onClick={() => handleResetDemo(paymentId || 'pay_demo_execute_001')}
          disabled={!!busy}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
        >
          <span>Reset Demo State</span>
        </button>
      </div>

      {/* Quick Demo Preset Selector */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="text-[#6F6A64] font-bold uppercase tracking-wider">Demo Presets:</span>
        <button
          onClick={() => { setPaymentId('pay_demo_execute_001'); setResult(null); setWebhookResult(null); }}
          className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
            paymentId === 'pay_demo_execute_001'
              ? 'bg-[#7D4047]/30 text-white border-[#7D4047]'
              : 'bg-white/5 text-[#DDD5CD] border-white/10 hover:border-white/20'
          }`}
        >
          pay_demo_execute_001 (ALLOW Demo)
        </button>
        <button
          onClick={() => { setPaymentId('pay_demo_0013'); setResult(null); setWebhookResult(null); }}
          className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
            paymentId === 'pay_demo_0013'
              ? 'bg-[#7D4047]/30 text-white border-[#7D4047]'
              : 'bg-white/5 text-[#DDD5CD] border-white/10 hover:border-white/20'
          }`}
        >
          pay_demo_0013 (ALLOW Demo)
        </button>
        <button
          onClick={() => { setPaymentId('pay_test_lifecycle_b'); setResult(null); setWebhookResult(null); }}
          className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
            paymentId === 'pay_test_lifecycle_b'
              ? 'bg-[#7D4047]/30 text-white border-[#7D4047]'
              : 'bg-white/5 text-[#DDD5CD] border-white/10 hover:border-white/20'
          }`}
        >
          pay_test_lifecycle_b (BLOCK Demo)
        </button>
      </div>

      {/* Input Control Container - Translucent Glass */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#1E1D1C]/80 border border-white/12 backdrop-blur-xl shadow-2xl lift-hover">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#DDD5CD] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runOperation('evaluate')}
              placeholder="Enter Payment ID (e.g. pay_demo_execute_001)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/15 bg-white/[0.04] text-sm focus:outline-none focus:border-[#7D4047] focus:bg-white/[0.08] transition-all text-[#F8F6F2] font-mono placeholder:text-[#6F6A64]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <GlassButton
              variant="secondary"
              size="md"
              disabled={!!busy}
              onClick={() => runOperation('diagnose')}
              icon={Bot}
            >
              {busy === 'diagnose' ? 'Diagnosing...' : 'AI Diagnose'}
            </GlassButton>

            <GlassButton
              variant="secondary"
              size="md"
              disabled={!!busy}
              onClick={() => runOperation('evaluate')}
              icon={FileSearch}
            >
              {busy === 'evaluate' ? 'Evaluating...' : 'Evaluate Pipeline'}
            </GlassButton>

            <GlassButton
              variant="primary"
              size="md"
              disabled={!!busy}
              onClick={() => {
                if (!paymentId.trim()) {
                  setError('Enter a payment ID first.');
                  return;
                }
                setConfirmModal(true);
              }}
              icon={Play}
            >
              {busy === 'execute' ? 'Executing...' : 'Execute Recovery'}
            </GlassButton>
          </div>

        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#DDD5CD] font-mono opacity-80">
          <span>AI advisory diagnosis does not mutate state.</span>
          <span className="text-[#34D399] font-bold uppercase tracking-wider">● Deterministic Policy Active</span>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm font-mono flex items-center justify-between shadow-xl">
          <span>✓ {toast}</span>
          <button onClick={() => setToast(null)} className="font-bold underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-[#7D4047]/20 border border-[#7D4047]/40 text-rose-200 text-sm font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* The 4 Tiers - Translucent Architectural Glass Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tier 1: AI Advice */}
        <div className="p-6 rounded-3xl bg-[#1E1D1C]/80 border border-white/12 backdrop-blur-xl shadow-xl flex flex-col justify-between lift-hover">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-sky-400">
                <Bot className="w-5 h-5" />
                <h3 className="font-bold font-mono text-sm text-[#F8F6F2]">1. AI Advisory</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                  d?.source === 'anthropic'
                    ? 'text-purple-300 bg-purple-500/10 border-purple-500/30'
                    : 'text-sky-400 bg-sky-500/10 border-sky-500/20'
                }`}>
                  {d?.source === 'anthropic' ? 'CLAUDE ENHANCED' : 'LOCAL ADVISORY'}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase text-[#DDD5CD] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  Non-Binding
                </span>
              </div>
            </div>

            {d ? (
              <div className="mt-4 space-y-3 font-mono">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[10px] uppercase text-[#6F6A64] font-bold">Diagnosed Root Cause</span>
                  <p className="text-xs font-bold text-white capitalize mt-0.5">{d.root_cause || '—'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] uppercase text-[#6F6A64] font-bold">Recoverability</span>
                    <p className="text-xs font-bold text-emerald-400 mt-0.5">
                      {d.recoverability !== undefined ? `${Math.round(d.recoverability * 100)}%` : '—'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] uppercase text-[#6F6A64] font-bold">Confidence</span>
                    <p className="text-xs font-bold text-sky-400 mt-0.5">
                      {d.confidence !== undefined ? `${Math.round(d.confidence * 100)}%` : '—'}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#DDD5CD] leading-relaxed font-light">
                  {d.reason || 'AI diagnosis reasoning generated.'}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#6F6A64] font-mono leading-relaxed">
                No diagnosis record exists.<br />Click <strong className="text-sky-400 font-bold">AI Diagnose</strong> to generate advisory diagnosis.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 space-y-1">
            <div className="text-[11px] font-mono text-[#817B75] flex items-center justify-between">
              <span>{d?.source === 'anthropic' ? 'Anthropic Claude AI Layer' : 'Built-in Deterministic Engine'}</span>
              <span className="text-[10px] uppercase font-bold text-emerald-400">● Active</span>
            </div>
            <p className="text-[10px] font-mono text-[#6F6A64] leading-tight">
              When no external AI provider is configured, RecoveryPilot uses its built-in deterministic diagnosis engine.
            </p>
          </div>
        </div>

        {/* Tier 2: Decision Engine */}
        <div className="p-6 rounded-3xl bg-[#1E1D1C]/80 border border-white/12 backdrop-blur-xl shadow-xl flex flex-col justify-between lift-hover">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-[#7D4047]">
                <Zap className="w-5 h-5" />
                <h3 className="font-bold font-mono text-sm text-[#F8F6F2]">2. Decision Engine</h3>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#7D4047] bg-[#7D4047]/10 px-2 py-0.5 rounded-full border border-[#7D4047]/30">
                Deterministic
              </span>
            </div>

            {decision ? (
              <div className="mt-4 space-y-3 font-mono">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[10px] uppercase text-[#6F6A64] font-bold">Candidate Action</span>
                  <p className="text-xs font-bold text-[#7D4047] uppercase mt-0.5">
                    {decision.candidate_action || '—'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[10px] uppercase text-[#6F6A64] font-bold">Mapping Rule</span>
                  <p className="text-xs text-sky-400 font-bold mt-0.5">
                    {decision.source || 'playbook_matrix'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#DDD5CD] leading-relaxed font-light">
                  {decision.reason || 'Decision playbook evaluated.'}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#6F6A64] font-mono">
                Run Evaluate or Execute to inspect playbook mapping.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-[#6F6A64]">
            Deterministic Playbook Layer
          </div>
        </div>

        {/* Tier 3: Policy Authority */}
        <div className="p-6 rounded-3xl bg-[#1E1D1C]/80 border border-white/12 backdrop-blur-xl shadow-xl flex flex-col justify-between lift-hover">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold font-mono text-sm text-[#F8F6F2]">3. Policy Gate</h3>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Authoritative
              </span>
            </div>

            {policy ? (
              <div className="mt-4 space-y-3 font-mono">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-[#6F6A64] font-bold">Policy Verdict</span>
                    <p className="text-xs font-bold text-white mt-0.5">Decision: {policy.decision}</p>
                  </div>
                  <StatusBadge status={policy.decision} />
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[10px] uppercase text-[#6F6A64] font-bold">Enforced Rule</span>
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                    {policy.rule || 'standard_policy'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#DDD5CD] leading-relaxed font-light">
                  {policy.reason || 'Guardrail validation passed.'}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#6F6A64] font-mono">
                Run Evaluate or Execute to inspect policy authority.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-[#6F6A64]">
            Policy Engine Guardrail Layer
          </div>
        </div>

        {/* Tier 4: Execution Result */}
        <div className="p-6 rounded-3xl bg-[#1E1D1C]/80 border border-white/12 backdrop-blur-xl shadow-xl flex flex-col justify-between lift-hover">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-[#F8F6F2]">
                <Play className="w-5 h-5 text-[#7D4047]" />
                <h3 className="font-bold font-mono text-sm text-[#F8F6F2]">4. Execution</h3>
              </div>
              <span className="text-[10px] font-mono uppercase text-[#DDD5CD] bg-white/5 px-2 py-0.5 rounded-full border border-white/10 font-bold">
                External Layer
              </span>
            </div>

            {exec ? (
              <div className="mt-4 space-y-3 font-mono">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-[#6F6A64] font-bold">Status</span>
                    <p className="text-xs font-bold text-white uppercase mt-0.5">{exec.status || 'EXECUTED'}</p>
                  </div>
                  <StatusBadge status={exec.status || 'executed'} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] uppercase text-[#6F6A64] font-bold">Action Dispatched</span>
                    <p className="text-xs font-bold text-[#7D4047] uppercase mt-0.5">
                      {exec.action || '—'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] uppercase text-[#6F6A64] font-bold">Execution Mode</span>
                    <p className="text-xs font-bold text-sky-400 uppercase mt-0.5">
                      {exec.provider ? exec.provider.replace('_', ' ') : 'MOCK GATEWAY'}
                    </p>
                  </div>
                </div>

                {exec.reference_id && (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] uppercase text-[#6F6A64] font-bold">Reference ID</span>
                    <p className="text-xs text-sky-400 font-bold truncate mt-0.5">
                      {exec.reference_id}
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#DDD5CD] leading-relaxed font-light">
                  {exec.reason || exec.error || exec.message || 'Execution logged.'}
                </div>

                {/* Simulated Webhook Trigger for EXECUTED payments */}
                {exec.status === 'executed' && (
                  <div className="pt-2">
                    {webhookResult?.status === 'recovered' ? (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span>VERIFIED RECOVERED</span>
                          <StatusBadge status="recovered" label="RECOVERED" />
                        </div>
                        <p className="text-[10px] text-emerald-300/80 font-mono">
                          Razorpay HMAC-SHA256 signature verified. Revenue settled into SQLite.
                        </p>
                      </div>
                    ) : (
                      <GlassButton
                        variant="primary"
                        size="sm"
                        disabled={busy === 'webhook'}
                        onClick={async () => {
                          if (!paymentId.trim()) return;
                          setBusy('webhook');
                          setError(null);
                          try {
                            const res = await api.simulateWebhook(paymentId.trim());
                            setWebhookResult(res);
                          } catch (err) {
                            setError(err.message || 'Webhook verification failed');
                          } finally {
                            setBusy('');
                          }
                        }}
                        className="w-full justify-center text-xs"
                      >
                        {busy === 'webhook' ? 'Verifying HMAC...' : 'Simulate Webhook Settlement (HMAC Verified)'}
                      </GlassButton>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#6F6A64] font-mono">
                Execute mode will dispatch recovery action when allowed.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-[#6F6A64]">
            Razorpay & Communication Layer
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#1E1D1C] rounded-3xl p-6 border border-white/16 shadow-2xl space-y-4 text-white font-mono"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#7D4047]/20 text-[#7D4047] flex items-center justify-center border border-[#7D4047]/30">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-base font-bold text-white">
                Execute Recovery for {paymentId}?
              </h4>
              <p className="text-xs text-[#DDD5CD] mt-1 leading-relaxed">
                This triggers the full pipeline: AI diagnosis, Decision playbook, Policy check, and if allowed, execution of the recovery action.
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
                variant="primary"
                size="sm"
                onClick={() => {
                  setConfirmModal(false);
                  runOperation('execute');
                }}
              >
                Execute Safely
              </GlassButton>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

export default DecisionWorkbenchView;
