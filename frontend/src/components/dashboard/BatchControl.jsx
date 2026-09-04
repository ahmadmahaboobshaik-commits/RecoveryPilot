import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { GlowButton } from '../ui/GlowButton';
import { Play, ShieldAlert, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export function BatchControl({ onRunBatch, isRunning, lastBatchResult }) {
  const [mode, setMode] = useState('dry_run');
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'SCANNING PAYMENTS',
    'FILTERING ELIGIBILITY',
    'AI DIAGNOSING',
    'EVALUATING POLICY',
    'EXECUTING APPROVED ACTIONS',
    'WAITING FOR VERIFIED OUTCOMES'
  ];

  const handleRun = async () => {
    if (isRunning) return;

    // Simulate step progression visually while backend batch process executes
    setCurrentStep(0);
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 400);

    try {
      await onRunBatch(mode);
    } finally {
      clearInterval(interval);
      setCurrentStep(steps.length - 1);
    }
  };

  return (
    <GlassCard glow={mode === 'execute' ? 'amber' : 'violet'} className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Recovery Cycle Orchestrator</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Orchestrate batch diagnosis, policy checks, and safe execution across all payments.
          </p>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => setMode('dry_run')}
            className={clsx(
              'px-3 py-1.5 rounded-lg font-semibold transition-all',
              mode === 'dry_run'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-white'
            )}
          >
            DRY RUN
          </button>

          <button
            onClick={() => setMode('execute')}
            className={clsx(
              'px-3 py-1.5 rounded-lg font-semibold transition-all',
              mode === 'execute'
                ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white'
            )}
          >
            EXECUTE
          </button>
        </div>
      </div>

      {/* Safety Notice for Execute Mode */}
      {mode === 'execute' && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Execute Mode Safety Warning:</span> Execute mode may trigger real Razorpay Test Mode Payment Links and customer nudges ONLY for payments permitted by Policy Engine guardrails (`policy.decision == 'allow'`).
          </div>
        </div>
      )}

      {/* Run Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-400 font-mono">
          Selected Mode: <span className="text-white font-bold uppercase">{mode.replace('_', ' ')}</span>
        </div>

        <GlowButton
          variant={mode === 'execute' ? 'warning' : 'primary'}
          size="md"
          icon={Play}
          loading={isRunning}
          onClick={handleRun}
        >
          {mode === 'execute' ? 'RUN TEST RECOVERY' : 'RUN DRY RUN'}
        </GlowButton>
      </div>

      {/* Live Step Progression Visualizer during or after run */}
      {(isRunning || lastBatchResult) && (
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-semibold">BATCH EXECUTION SEQUENCE</span>
            {lastBatchResult && (
              <span className="text-emerald-400 font-bold">
                PROCESSED {lastBatchResult.total_scanned} / {lastBatchResult.total_scanned} PAYMENTS
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {steps.map((stepName, idx) => {
              const isCompleted = lastBatchResult || (isRunning && idx < currentStep);
              const isCurrent = isRunning && idx === currentStep;

              return (
                <div
                  key={stepName}
                  className={clsx(
                    'p-2.5 rounded-xl border text-[10px] font-mono leading-tight flex flex-col justify-between h-16 transition-all',
                    isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : isCurrent
                      ? 'bg-violet-500/20 border-violet-500/50 text-white animate-pulse'
                      : 'bg-white/5 border-white/5 text-slate-500'
                  )}
                >
                  <span className="font-bold">STEP 0{idx + 1}</span>
                  <span className="font-semibold tracking-tighter truncate">{stepName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
