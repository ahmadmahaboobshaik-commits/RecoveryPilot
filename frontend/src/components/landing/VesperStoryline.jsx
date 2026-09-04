import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Brain, GitBranch, Shield, Zap, CheckCircle2 } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

export default function VesperStoryline({ onOpenCommandCenter }) {
  return (
    <section id="journey-section" className="py-24 px-6 sm:px-12 lg:px-20 text-[#F8F6F2] relative z-10 bg-[#171717]">
      
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-20 text-center">
        <motion.div {...fadeInUp} className="space-y-4">
          <div className="eyebrow-pill-framer">
            <span>RECOVERY OPERATIONS PIPELINE</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#F8F6F2]">
            THE RECOVERY <span className="font-serif-italic font-normal text-[#7D4047]">JOURNEY</span>
          </h2>
          <p className="text-base sm:text-lg text-[#DDD5CD] max-w-2xl mx-auto font-normal">
            From initial payment signal drop to deterministic policy evaluation and verified settlement.
          </p>
        </motion.div>
      </div>

      {/* 6-Stage Narrative Grid Container */}
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Stage 01 & Stage 02 Side-by-Side */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Stage 01: FAILED */}
          <motion.div {...fadeInUp} className="p-8 rounded-2xl bg-[#1E1D1C]/90 border border-white/12 backdrop-blur-xl relative overflow-hidden lift-hover">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 font-mono text-xs">
              <span className="text-[#7D4047] font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                01 — FAILED
              </span>
              <span className="text-[#6F6A64]">INGESTION</span>
            </div>

            <h3 className="text-2xl font-bold text-[#F8F6F2] mb-2 font-display">Payment Fails at Gateway</h3>
            <p className="text-sm text-[#DDD5CD] mb-6 leading-relaxed font-normal">
              Customer attempt is rejected by Razorpay due to insufficient balance. Signal is immediately ingested into RecoveryPilot telemetry.
            </p>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-xs space-y-2">
              <div className="flex justify-between text-[#DDD5CD]">
                <span>TRANSACTION:</span>
                <span className="text-white font-bold">PAY_TEST_9042</span>
              </div>
              <div className="flex justify-between text-[#DDD5CD]">
                <span>VALUE:</span>
                <span className="text-[#7D4047] font-bold">₹24,999</span>
              </div>
              <div className="flex justify-between text-[#DDD5CD]">
                <span>ERROR CODE:</span>
                <span className="text-slate-300">INSUFFICIENT_FUNDS</span>
              </div>
            </div>
          </motion.div>

          {/* Stage 02: UNDERSTAND */}
          <motion.div {...fadeInUp} className="p-8 rounded-2xl bg-[#1E1D1C]/90 border border-white/12 backdrop-blur-xl relative overflow-hidden lift-hover">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 font-mono text-xs">
              <span className="text-sky-400 font-bold flex items-center gap-2">
                <Brain className="w-4 h-4" />
                02 — UNDERSTAND
              </span>
              <span className="text-[#6F6A64]">AI DIAGNOSIS</span>
            </div>

            <h3 className="text-2xl font-bold text-[#F8F6F2] mb-2 font-display">Claude AI Diagnoses Failure</h3>
            <p className="text-sm text-[#DDD5CD] mb-6 leading-relaxed font-normal">
              AI evaluates transaction history, bank rails, and failure patterns to compute probability of recovery without human intervention.
            </p>

            <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/20 font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#DDD5CD]">ROOT CAUSE:</span>
                <span className="text-sky-300 font-bold">TEMPORARY LIQUIDITY DROP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#DDD5CD]">RECOVERABILITY SCORE:</span>
                <span className="text-emerald-400 font-bold">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#DDD5CD]">CONFIDENCE:</span>
                <span className="text-sky-400 font-bold">92%</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Stage 03 & Stage 04 Side-by-Side */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Stage 03: DECIDE */}
          <motion.div {...fadeInUp} className="p-8 rounded-2xl bg-[#1E1D1C]/90 border border-white/12 backdrop-blur-xl relative overflow-hidden lift-hover">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 font-mono text-xs">
              <span className="text-indigo-400 font-bold flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                03 — DECIDE
              </span>
              <span className="text-[#6F6A64]">DECISION ENGINE</span>
            </div>

            <h3 className="text-2xl font-bold text-[#F8F6F2] mb-2 font-display">Deterministic Action Selection</h3>
            <p className="text-sm text-[#DDD5CD] mb-6 leading-relaxed font-normal">
              Evaluates candidate strategies (Auto-Retry, Instant Payment Link, Dynamic Reminder) to pick the optimal execution vector.
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 flex justify-between items-center text-[#6F6A64]">
                <span>PATHWAY A: AUTO-RETRY GATEWAY</span>
                <span>REJECTED (LOW LIKELIHOOD)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#7D4047]/15 border border-[#7D4047]/30 flex justify-between items-center text-[#7D4047] font-bold">
                <span>PATHWAY B: PAYMENT LINK DISPATCH</span>
                <span className="text-emerald-400 font-bold">SELECTED ✓</span>
              </div>
            </div>
          </motion.div>

          {/* Stage 04: PROTECT */}
          <motion.div {...fadeInUp} className="p-8 rounded-2xl bg-[#1E1D1C]/90 border border-white/12 backdrop-blur-xl relative overflow-hidden lift-hover">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 font-mono text-xs">
              <span className="text-amber-400 font-bold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                04 — PROTECT
              </span>
              <span className="text-[#6F6A64]">POLICY ENGINE</span>
            </div>

            <h3 className="text-2xl font-bold text-[#F8F6F2] mb-2 font-display">Policy Gate Constraints Check</h3>
            <p className="text-sm text-[#DDD5CD] mb-6 leading-relaxed font-normal">
              Authoritative policy engine verifies cooldown periods, retry caps, user opt-outs, and compliance bounds before approving dispatch.
            </p>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-[#DDD5CD]">
                OPT-OUT CHECK: <span className="text-emerald-400 font-bold">CLEAR</span>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-[#DDD5CD]">
                COOLDOWN: <span className="text-emerald-400 font-bold">CLEAR</span>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-[#DDD5CD]">
                RETRY CAP: <span className="text-emerald-400 font-bold">OK (1/3)</span>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-[#DDD5CD]">
                POLICY VERDICT: <span className="text-sky-400 font-bold">APPROVED</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Stage 05 & Stage 06 Side-by-Side */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Stage 05: RECOVER */}
          <motion.div {...fadeInUp} className="p-8 rounded-2xl bg-[#1E1D1C]/90 border border-white/12 backdrop-blur-xl relative overflow-hidden lift-hover">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 font-mono text-xs">
              <span className="text-sky-400 font-bold flex items-center gap-2">
                <Zap className="w-4 h-4" />
                05 — RECOVER
              </span>
              <span className="text-[#6F6A64]">DISPATCH EXECUTION</span>
            </div>

            <h3 className="text-2xl font-bold text-[#F8F6F2] mb-2 font-display">Automated Action Dispatch</h3>
            <p className="text-sm text-[#DDD5CD] mb-6 leading-relaxed font-normal">
              Personalized SMS/WhatsApp payment link generated with Razorpay API payload dispatched to customer.
            </p>

            <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/20 font-mono text-xs flex justify-between items-center text-sky-300">
              <span>DISPATCH STATUS:</span>
              <span className="font-bold text-white uppercase tracking-wider">LINK_GENERATED_AND_SENT</span>
            </div>
          </motion.div>

          {/* Stage 06: VERIFY */}
          <motion.div {...fadeInUp} className="p-8 rounded-2xl bg-[#1E1D1C]/90 border border-white/12 backdrop-blur-xl relative overflow-hidden lift-hover">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 font-mono text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                06 — VERIFY
              </span>
              <span className="text-[#6F6A64]">WEBHOOK SETTLEMENT</span>
            </div>

            <h3 className="text-2xl font-bold text-[#F8F6F2] mb-2 font-display">Verified Revenue Recovery</h3>
            <p className="text-sm text-[#DDD5CD] mb-6 leading-relaxed font-normal">
              Razorpay webhook confirms successful payment receipt. System marks transaction as 100% verified settlement.
            </p>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 font-mono text-xs flex justify-between items-center text-emerald-400 font-bold">
              <span>SETTLEMENT RESULT:</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
                ₹24,999 VERIFIED SETTLED ✓
              </span>
            </div>
          </motion.div>

        </div>

      </div>

    </section>
  );
}
