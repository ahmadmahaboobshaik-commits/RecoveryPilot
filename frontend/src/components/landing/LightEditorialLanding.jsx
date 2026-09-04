import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  BrainCircuit, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowUpRight,
  CreditCard,
  KeyRound,
  ServerCrash,
  Ban,
  Layers3,
  Check,
  ChevronDown
} from 'lucide-react';
import LiquidGlass from '../ui/LiquidGlass';
import GlassButton from '../ui/GlassButton';
import AnimatedCounter from '../ui/AnimatedCounter';
import StatusBadge from '../ui/StatusBadge';
import { formatRupees, formatRupeesShort } from '../../lib/formatters';

const fadeInUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

export function LightEditorialLanding({ 
  metrics, 
  activities = [], 
  onOpenCommandCenter, 
  onSelectPayment 
}) {
  const [selectedCauseId, setSelectedCauseId] = useState('timeout');

  const totalAtRisk = metrics?.total_at_risk || 0;
  const totalRecovered = metrics?.total_recovered || 0;
  const recoveryRate = metrics?.recovery_rate || 0;
  const failedCount = metrics?.failed_payment_count || 0;
  const recoveredCount = metrics?.recovered_payment_count || 0;

  const failureCauses = [
    {
      id: 'timeout',
      code: 'BANK_TIMEOUT',
      icon: Clock,
      name: 'Bank Server Timeout',
      recoverability: 0.85,
      confidence: 0.94,
      playbook: 'Automated Smart Retry',
      policy: 'Allowed (Cooldown Passed)',
      explanation: 'Transient inter-bank network failure. Highly recoverable via paced retry algorithms with zero customer friction.'
    },
    {
      id: 'funds',
      code: 'INSUFFICIENT_FUNDS',
      icon: CreditCard,
      name: 'Insufficient Balance',
      recoverability: 0.62,
      confidence: 0.89,
      playbook: 'Timed Self-Service Link',
      policy: 'Allowed (Payday Cycle Checked)',
      explanation: 'Customer balance deficient at billing instant. Dispatches personalized payment link aligned with liquidity cycles.'
    },
    {
      id: 'expired',
      code: 'CARD_EXPIRED',
      icon: Ban,
      name: 'Card Expired',
      recoverability: 0.12,
      confidence: 0.98,
      playbook: 'New Card Payment Link',
      policy: 'Allowed (Direct Payment Link)',
      explanation: 'Card credentials obsolete. Automated retry is strictly suppressed; a secure link is generated for seamless card update.'
    },
    {
      id: '3ds',
      code: '3DS_AUTH_FAILED',
      icon: KeyRound,
      name: '3DS Auth Dropped',
      recoverability: 0.74,
      confidence: 0.91,
      playbook: '1-Click Resume Link',
      policy: 'Allowed (Touch Cap 1)',
      explanation: 'Customer dropped off during OTP/biometric challenge. Resumption link allows instant 1-click checkout recovery.'
    },
    {
      id: 'gateway',
      code: 'GATEWAY_ERROR',
      icon: ServerCrash,
      name: 'Processor Glitch',
      recoverability: 0.88,
      confidence: 0.96,
      playbook: 'Secondary Channel Retry',
      policy: 'Allowed (Circuit Breaker OK)',
      explanation: 'Gateway infrastructure disruption. Alternate gateway route dispatches payment for immediate recovery.'
    }
  ];

  const currentCause = failureCauses.find(c => c.id === selectedCauseId) || failureCauses[0];

  const safetyRules = [
    { rule: 'CUSTOMER OPTED OUT', condition: 'opted_out == True', verdict: 'BLOCKED', color: 'rose', desc: 'Strict regulatory and user preference compliance.' },
    { rule: '3-ATTEMPT RETRY CAP', condition: 'retry_count >= 3', verdict: 'BLOCKED', color: 'rose', desc: 'Prevents customer fatigue and card network penalties.' },
    { rule: 'COOLDOWN WINDOW', condition: 'cooldown_hours < min', verdict: 'WAIT', color: 'amber', desc: 'Enforces deliberate pacing between recovery touches.' },
    { rule: 'LOW AI CONFIDENCE', condition: 'confidence < 0.70', verdict: 'WAIT / FALLBACK', color: 'amber', desc: 'Deterministic safe fallback if diagnosis confidence is low.' },
    { rule: 'OUTSIDE RECOVERY WINDOW', condition: 'age_days > 7', verdict: 'BLOCKED', color: 'rose', desc: 'Prevents chasing stale checkout instances past relevancy.' },
    { rule: 'POLICY APPROVED', condition: 'all_guardrails == PASS', verdict: 'EXECUTE', color: 'emerald', desc: 'Safe recovery action created (Razorpay link / reminder).' }
  ];

  return (
    <div className="relative z-10 w-full overflow-hidden text-[#0F172A]">

      {/* =========================================================================
          HERO: Warm Light Editorial Framer Composition
          ========================================================================= */}
      <section className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-24 pt-36 pb-16">
        
        {/* Top Coordinates */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow-pill-light"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-600 animate-ping" />
            <span>Autonomous Revenue Recovery Engine</span>
          </motion.div>

          <div className="hidden sm:flex items-center gap-6 font-mono text-[11px] text-slate-500 font-semibold">
            <span>[ RECOVERY ENGINE / 01 ]</span>
            <span>[ LIVE MONITORED ]</span>
          </div>
        </div>

        {/* Massive Editorial Headline */}
        <div className="max-w-5xl my-auto py-12">
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="hero-headline-light"
          >
            PAYMENTS FAIL. <br />
            <span className="font-serif italic font-normal text-slate-500">
              REVENUE DOESN'T
            </span> <br />
            HAVE TO.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-lg sm:text-2xl text-slate-600 max-w-2xl font-normal leading-relaxed"
          >
            RecoveryPilot diagnoses failed checkout events, chooses the safest recovery path, executes approved actions, and verifies recovered revenue through cryptographic proof.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <GlassButton
              size="lg"
              variant="primary"
              onClick={onOpenCommandCenter}
              className="group"
            >
              ENTER RECOVERY CORE
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </GlassButton>

            <GlassButton
              size="lg"
              variant="secondary"
              onClick={() => {
                const el = document.getElementById('storyline-start');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              EXPLORE RECOVERY
            </GlassButton>
          </motion.div>
        </div>

        {/* Real Telemetry Coordinates Bar */}
        <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-slate-900/10 text-xs font-mono">
          <div>
            <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Gross Volume At Risk</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#0F172A] mt-1">
              <AnimatedCounter value={totalAtRisk} type="currencyShort" />
            </div>
            <span className="text-slate-400 text-[10px]">Live Monitored</span>
          </div>

          <div>
            <span className="text-emerald-700 uppercase tracking-wider block text-[10px] font-bold">Verified Recovered</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-600 mt-1">
              <AnimatedCounter value={totalRecovered} type="currencyShort" />
            </div>
            <span className="text-slate-400 text-[10px]">Settled Revenue</span>
          </div>

          <div>
            <span className="text-cyan-700 uppercase tracking-wider block text-[10px] font-bold">Recovery Conversion</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-cyan-600 mt-1">
              <AnimatedCounter value={recoveryRate} type="percent" />
            </div>
            <span className="text-slate-400 text-[10px]">Deterministic Pipeline</span>
          </div>

          <div>
            <span className="text-rose-700 uppercase tracking-wider block text-[10px] font-bold">Failed Queue</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#0F172A] mt-1">
              <AnimatedCounter value={failedCount} type="number" />
            </div>
            <span className="text-slate-400 text-[10px]">Transactions Monitored</span>
          </div>
        </div>
      </section>


      {/* =========================================================================
          THE 6-CHAPTER SCROLL STORYLINE (Continuous Living System)
          ========================================================================= */}
      <section id="storyline-start" className="space-y-48 py-32 px-6 sm:px-12 lg:px-24">
        
        {/* Chapter 01: FAILED */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="eyebrow-pill-light mb-4 text-rose-600 border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Chapter 01 · Signal Dropped</span>
            </div>
            <h2 className="section-headline-light">
              A payment fails. <br />
              <span className="font-serif italic font-normal text-rose-600">The Core senses it.</span>
            </h2>
            <div className="mt-8 p-6 rounded-3xl bg-white/90 border border-slate-900/10 shadow-lg shadow-slate-900/5 max-w-xl font-mono text-xs space-y-3">
              <div className="flex justify-between items-center text-slate-500 font-bold">
                <span>SIGNAL EVENT:</span>
                <span className="text-rose-600">PAYMENT FAILED</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 font-bold">
                <span>VALUE AT RISK:</span>
                <span className="text-[#0F172A] text-base">₹24,999</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 font-bold">
                <span>GATEWAY CODE:</span>
                <span className="text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">INSUFFICIENT_FUNDS</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chapter 02: DIAGNOSIS */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="eyebrow-pill-light mb-4 text-violet-600 border-violet-200">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <span>Chapter 02 · Advisory AI</span>
            </div>
            <h2 className="section-headline-light">
              The particle enters. <br />
              <span className="font-serif italic font-normal text-violet-600">AI calculates root cause.</span>
            </h2>
            <div className="mt-8 grid sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-6 rounded-3xl bg-white/90 border border-slate-900/10 shadow-xs">
                <span className="text-slate-500 uppercase block text-[10px] font-bold">Root Cause</span>
                <span className="text-[#0F172A] font-bold text-sm block mt-1">INSUFFICIENT FUNDS</span>
              </div>
              <div className="p-6 rounded-3xl bg-white/90 border border-slate-900/10 shadow-xs">
                <span className="text-slate-500 uppercase block text-[10px] font-bold">Recoverability</span>
                <span className="text-violet-600 font-bold text-sm block mt-1">85% High</span>
              </div>
              <div className="p-6 rounded-3xl bg-white/90 border border-slate-900/10 shadow-xs">
                <span className="text-slate-500 uppercase block text-[10px] font-bold">Confidence</span>
                <span className="text-cyan-600 font-bold text-sm block mt-1">92% Deterministic</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chapter 03: DECISION */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="eyebrow-pill-light mb-4 text-cyan-600 border-cyan-200">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span>Chapter 03 · Decision Engine</span>
            </div>
            <h2 className="section-headline-light">
              THE SAFEST ACTION. <br />
              <span className="font-serif italic font-normal text-cyan-600">NOT JUST AN ACTION.</span>
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-xs">
              <span className="px-4 py-2.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold shadow-xs">
                PAYMENT LINK (Selected)
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 font-medium">RETRY (Simulated)</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 font-medium">REMINDER</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 font-medium">STOP</span>
            </div>
          </motion.div>
        </div>

        {/* Chapter 04: POLICY */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="eyebrow-pill-light mb-4 text-emerald-600 border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Chapter 04 · Policy Authority</span>
            </div>
            <h2 className="section-headline-light">
              The safety gate evaluates. <br />
              <span className="font-serif italic font-normal text-emerald-600">AI cannot bypass policy.</span>
            </h2>
            <div className="mt-8 grid sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-900/10 flex justify-between shadow-xs">
                <span className="text-slate-500 font-semibold">OPTED OUT?</span>
                <span className="text-emerald-600 font-bold">NO · CLEAR</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-900/10 flex justify-between shadow-xs">
                <span className="text-slate-500 font-semibold">COOLDOWN WINDOW?</span>
                <span className="text-emerald-600 font-bold">PASSED · CLEAR</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-900/10 flex justify-between shadow-xs">
                <span className="text-slate-500 font-semibold">RETRY LIMIT CAP?</span>
                <span className="text-emerald-600 font-bold">1 / 3 · OK</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-900/10 flex justify-between shadow-xs">
                <span className="text-slate-500 font-semibold">7-DAY WINDOW?</span>
                <span className="text-emerald-600 font-bold">2 DAYS · OK</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chapter 05: RECOVERY */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="eyebrow-pill-light mb-4 text-cyan-600 border-cyan-200">
              <Zap className="w-3.5 h-3.5" />
              <span>Chapter 05 · Controlled Execution</span>
            </div>
            <h2 className="section-headline-light">
              Energy flows outward. <br />
              <span className="font-serif italic font-normal text-cyan-600">Recovery action active.</span>
            </h2>
            <div className="mt-8 p-6 rounded-3xl bg-white/90 border border-slate-900/10 font-mono text-xs text-slate-700 max-w-lg space-y-2 shadow-xs">
              <p className="font-bold">ACTION DISPATCHED: Razorpay Payment Link</p>
              <p className="text-amber-600 font-bold">STATUS: Pending Customer Settlement</p>
            </div>
          </motion.div>
        </div>

        {/* Chapter 06: VERIFIED */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="eyebrow-pill-light mb-4 text-emerald-600 border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Chapter 06 · Verified Payoff</span>
            </div>
            <h2 className="text-5xl sm:text-7xl font-extrabold font-display tracking-tight leading-tight text-[#0F172A]">
              RECOVERY VERIFIED. <br />
              <span className="font-serif italic font-normal text-emerald-600">
                ₹24,999
              </span> RECOVERED.
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-xs text-slate-500 font-bold">
              <span className="text-rose-600">FAILED</span>
              <span>→</span>
              <span className="text-violet-600">DIAGNOSED</span>
              <span>→</span>
              <span className="text-cyan-600">DECIDED</span>
              <span>→</span>
              <span className="text-emerald-600">APPROVED</span>
              <span>→</span>
              <span className="text-amber-600">EXECUTED</span>
              <span>→</span>
              <span className="text-emerald-700 font-extrabold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 shadow-xs">
                VERIFIED
              </span>
            </div>
          </motion.div>
        </div>

      </section>


      {/* =========================================================================
          PRODUCT SECTION 1: UNDERSTAND WHY IT FAILED (Interactive Matrix)
          ========================================================================= */}
      <section className="py-32 px-6 sm:px-12 lg:px-24 border-t border-slate-900/10">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="max-w-3xl">
            <div className="eyebrow-pill-light mb-4">
              <BrainCircuit className="w-3.5 h-3.5 text-violet-600" />
              <span>Diagnostic Telemetry</span>
            </div>
            <h2 className="section-headline-light">
              UNDERSTAND WHY <br />
              <span className="font-serif italic font-normal text-slate-500">PAYMENTS FAIL.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-600 font-normal leading-relaxed">
              Every checkout failure contains hidden signals. Claude AI diagnoses error codes and transaction velocity to determine exact recoverability.
            </p>
          </motion.div>

          {/* Interactive Failure Cause Matrix */}
          <motion.div {...fadeInUp} className="mt-16">
            <div className="p-8 sm:p-10 rounded-[32px] bg-white border border-slate-900/10 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.05)] space-y-8">
              
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 pb-6 border-b border-slate-900/10">
                {failureCauses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCauseId(c.id)}
                    className={`px-4 py-2 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                      selectedCauseId === c.id 
                        ? 'bg-[#0F172A] text-white shadow-md' 
                        : 'bg-slate-50 text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Active Cause Display */}
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                      <currentCause.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold font-display text-[#0F172A]">{currentCause.name}</h4>
                      <span className="font-mono text-xs text-slate-500 font-bold">{currentCause.code}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed pt-2">
                    {currentCause.explanation}
                  </p>
                </div>

                <div className="lg:col-span-5 space-y-3 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 font-semibold">Recoverability Score:</span>
                    <span className="text-violet-700 font-bold text-sm">
                      {Math.round(currentCause.recoverability * 100)}%
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 font-semibold">AI Confidence:</span>
                    <span className="text-cyan-700 font-bold text-sm">
                      {Math.round(currentCause.confidence * 100)}%
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 font-semibold">Candidate Playbook:</span>
                    <span className="text-[#0F172A] font-bold text-xs">{currentCause.playbook}</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>


      {/* =========================================================================
          PRODUCT SECTION 2: 4-LAYER HIERARCHY
          ========================================================================= */}
      <section className="py-32 px-6 sm:px-12 lg:px-24 border-t border-slate-900/10">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="max-w-3xl">
            <div className="eyebrow-pill-light mb-4">
              <Zap className="w-3.5 h-3.5 text-cyan-600" />
              <span>Deterministic Architecture</span>
            </div>
            <h2 className="section-headline-light">
              THE SAFEST ACTION. <br />
              <span className="font-serif italic font-normal text-cyan-600">NOT JUST AN ACTION.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-600 font-normal leading-relaxed">
              AI suggests. Deterministic playbooks map. Authoritative policies gate. Execution executes only when allowed.
            </p>
          </motion.div>

          <motion.div {...fadeInUp} className="mt-16 grid sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-6 rounded-3xl bg-white border border-slate-900/10 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-violet-600">Layer 1</span>
              <h4 className="text-sm font-bold text-[#0F172A] mt-2">AI ADVISORY</h4>
              <p className="text-slate-500 mt-2 text-[11px] leading-relaxed">
                Calculates root cause & probability score without mutating state.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-900/10 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-cyan-600">Layer 2</span>
              <h4 className="text-sm font-bold text-[#0F172A] mt-2">DECISION ENGINE</h4>
              <p className="text-slate-500 mt-2 text-[11px] leading-relaxed">
                Deterministic matrix selects candidate recovery action.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-900/10 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-600">Layer 3</span>
              <h4 className="text-sm font-bold text-[#0F172A] mt-2">POLICY GATE</h4>
              <p className="text-slate-500 mt-2 text-[11px] leading-relaxed">
                Authoritative guardrails verify opt-out, cooldown, and retry caps.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-900/10 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#0F172A]">Layer 4</span>
              <h4 className="text-sm font-bold text-[#0F172A] mt-2">SAFE EXECUTION</h4>
              <p className="text-slate-500 mt-2 text-[11px] leading-relaxed">
                Razorpay payment link created. Verified via HMAC webhook.
              </p>
            </div>
          </motion.div>
        </div>
      </section>


      {/* =========================================================================
          PRODUCT SECTION 3: RECOVER REVENUE WITHOUT LOSING CONTROL
          ========================================================================= */}
      <section className="py-32 px-6 sm:px-12 lg:px-24 border-t border-slate-900/10">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="eyebrow-pill-light mb-4">
                <Layers3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Operational Control</span>
              </div>
              <h2 className="section-headline-light">
                RECOVER REVENUE <br />
                <span className="font-serif italic font-normal text-emerald-600">WITHOUT LOSING CONTROL.</span>
              </h2>
            </div>

            <GlassButton
              variant="primary"
              size="md"
              onClick={onOpenCommandCenter}
              icon={ArrowRight}
            >
              Open Command Center
            </GlassButton>
          </motion.div>

          <motion.div {...fadeInUp} className="mt-14 grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-900/10 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Gross At Risk</span>
              <div className="text-2xl font-bold font-display text-[#0F172A] mt-1">
                <AnimatedCounter value={totalAtRisk} type="currencyShort" />
              </div>
              <span className="text-[10px] font-mono text-slate-400">Live Monitored</span>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-200 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-800">Total Recovered</span>
              <div className="text-2xl font-bold font-display text-emerald-600 mt-1">
                <AnimatedCounter value={totalRecovered} type="currencyShort" />
              </div>
              <span className="text-[10px] font-mono text-emerald-600">Verified Settled</span>
            </div>

            <div className="p-6 rounded-3xl bg-cyan-50/50 border border-cyan-200 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-800">Recovery Rate</span>
              <div className="text-2xl font-bold font-display text-cyan-600 mt-1">
                <AnimatedCounter value={recoveryRate} type="percent" />
              </div>
              <span className="text-[10px] font-mono text-cyan-600">Conversion</span>
            </div>

            <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-200 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-rose-800">Failed Queue</span>
              <div className="text-2xl font-bold font-display text-rose-600 mt-1">
                <AnimatedCounter value={failedCount} type="number" />
              </div>
              <span className="text-[10px] font-mono text-rose-600">Active Queue</span>
            </div>

            <div className="p-6 rounded-3xl bg-violet-50/50 border border-violet-200 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-violet-800">Recovered Count</span>
              <div className="text-2xl font-bold font-display text-violet-600 mt-1">
                <AnimatedCounter value={recoveredCount} type="number" />
              </div>
              <span className="text-[10px] font-mono text-violet-600">Settled Events</span>
            </div>
          </motion.div>
        </div>
      </section>


      {/* =========================================================================
          PRODUCT SECTION 4: AI CAN RECOMMEND. POLICY DECIDES.
          ========================================================================= */}
      <section className="py-32 px-6 sm:px-12 lg:px-24 border-t border-slate-900/10">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="max-w-3xl">
            <div className="eyebrow-pill-light mb-4 border-emerald-200 text-emerald-600">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strict Governance</span>
            </div>
            <h2 className="section-headline-light">
              AI CAN RECOMMEND. <br />
              <span className="font-serif italic font-normal text-emerald-600">POLICY DECIDES.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-600 font-normal leading-relaxed">
              Every candidate action must satisfy strict boundary rules before any customer communication or charge attempt occurs.
            </p>
          </motion.div>

          <motion.div {...fadeInUp} className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {safetyRules.map((s) => (
              <div key={s.rule} className="p-6 rounded-3xl bg-white border border-slate-900/10 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A] text-[11px]">{s.rule}</span>
                  <StatusBadge status={s.verdict} />
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 text-cyan-800 font-semibold text-[10px] border border-slate-200">
                  {s.condition}
                </div>
                <p className="text-slate-500 text-[11px] font-normal leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* =========================================================================
          EDITORIAL CTA CLOSE
          ========================================================================= */}
      <section className="py-36 px-6 sm:px-12 text-center border-t border-slate-900/10">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="eyebrow-pill-light mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-600 animate-ping" />
              <span>Living Financial Recovery</span>
            </div>

            <h2 className="hero-headline-light text-4xl sm:text-6xl font-extrabold">
              READY TO COMMAND <br />
              <span className="font-serif italic font-normal text-slate-500">
                YOUR RECOVERY ENGINE?
              </span>
            </h2>

            <p className="mt-6 text-slate-600 text-lg font-normal max-w-xl mx-auto leading-relaxed">
              Query the payment stream, inspect diagnoses, trigger batch dry runs, and verify settled revenue.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <GlassButton
                size="lg"
                variant="primary"
                onClick={onOpenCommandCenter}
                className="group"
              >
                ENTER COMMAND CENTER
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
              </GlassButton>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

export default LightEditorialLanding;
