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
  Lock,
  Layers3,
  WalletCards,
  RefreshCw,
  Sliders,
  Flame,
  Check
} from 'lucide-react';
import LiquidGlass from '../ui/LiquidGlass';
import GlassButton from '../ui/GlassButton';
import AnimatedCounter from '../ui/AnimatedCounter';
import StatusBadge from '../ui/StatusBadge';
import { formatRupees, formatRupeesShort } from '../../lib/formatters';

const fadeInUp = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] }
};

export function EditorialProductLanding({ 
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
    <div className="relative z-10 w-full overflow-hidden text-white">

      {/* =========================================================================
          HERO: Cinematic Asymmetrical Framer Composition
          ========================================================================= */}
      <section className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-24 pt-32 pb-16">
        
        {/* Top Eyebrow & Coordinates */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow-pill-dark"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Autonomous Revenue Recovery Engine</span>
          </motion.div>

          <div className="hidden sm:flex items-center gap-6 font-mono text-[11px] text-slate-500">
            <span>[ RECOVERY ENGINE / 01 ]</span>
            <span>[ LIVE MONITORED ]</span>
          </div>
        </div>

        {/* Massive Editorial Headline */}
        <div className="max-w-5xl my-auto py-12">
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black font-display tracking-tight leading-[0.95]"
          >
            PAYMENTS FAIL. <br />
            <span className="font-serif italic font-normal text-slate-300">
              REVENUE
            </span> <br />
            DOESN'T HAVE TO.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-lg sm:text-2xl text-slate-300 max-w-2xl font-light leading-relaxed"
          >
            RecoveryPilot turns failed checkout events into safe, explainable recovery actions through a living digital core.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
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

        {/* Live Gross At Risk & Telemetry Bar */}
        <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-white/10 text-xs font-mono">
          <div>
            <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Gross Volume At Risk</span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              <AnimatedCounter value={totalAtRisk} type="currencyShort" />
            </div>
            <span className="text-slate-500 text-[10px]">Live Monitored</span>
          </div>

          <div>
            <span className="text-emerald-400 uppercase tracking-wider block text-[10px]">Verified Recovered</span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-emerald-400 mt-1">
              <AnimatedCounter value={totalRecovered} type="currencyShort" />
            </div>
            <span className="text-slate-500 text-[10px]">Settled Revenue</span>
          </div>

          <div>
            <span className="text-cyan-400 uppercase tracking-wider block text-[10px]">Recovery Conversion</span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-cyan-400 mt-1">
              <AnimatedCounter value={recoveryRate} type="percent" />
            </div>
            <span className="text-slate-500 text-[10px]">Deterministic Pipeline</span>
          </div>

          <div>
            <span className="text-rose-400 uppercase tracking-wider block text-[10px]">Failed Queue</span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              <AnimatedCounter value={failedCount} type="number" />
            </div>
            <span className="text-slate-500 text-[10px]">Transactions Monitored</span>
          </div>
        </div>
      </section>


      {/* =========================================================================
          THE 6-CHAPTER SCROLL JOURNEY (Continuous Living System)
          ========================================================================= */}
      <section id="storyline-start" className="space-y-48 py-32 px-6 sm:px-12 lg:px-24">
        
        {/* Chapter 01: FAILED */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="eyebrow-pill-dark mb-4 border-rose-500/30 text-rose-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Chapter 01 · Signal Dropped</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight leading-tight">
              A payment fails. <br />
              <span className="font-serif italic font-normal text-rose-400">The Core senses it.</span>
            </h2>
            <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xl font-mono text-xs space-y-3">
              <div className="flex justify-between items-center text-slate-400">
                <span>SIGNAL EVENT:</span>
                <span className="text-rose-400 font-bold">PAYMENT FAILED</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>VALUE AT RISK:</span>
                <span className="text-white font-bold text-sm">₹24,999</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>GATEWAY CODE:</span>
                <span className="text-slate-200 bg-black/40 px-2 py-0.5 rounded border border-white/10">INSUFFICIENT_FUNDS</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chapter 02: DIAGNOSIS */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="eyebrow-pill-dark mb-4 border-violet-500/30 text-violet-300">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Chapter 02 · Advisory AI</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight leading-tight">
              The particle enters. <br />
              <span className="font-serif italic font-normal text-violet-300">AI calculates root cause.</span>
            </h2>
            <div className="mt-8 grid sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-slate-500 uppercase block text-[10px]">Root Cause</span>
                <span className="text-white font-bold text-sm block mt-1">INSUFFICIENT FUNDS</span>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-slate-500 uppercase block text-[10px]">Recoverability</span>
                <span className="text-violet-300 font-bold text-sm block mt-1">85% High</span>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-slate-500 uppercase block text-[10px]">Confidence</span>
                <span className="text-cyan-300 font-bold text-sm block mt-1">92% Deterministic</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chapter 03: DECISION */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="eyebrow-pill-dark mb-4 border-cyan-500/30 text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Chapter 03 · Decision Engine</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight leading-tight">
              THE SAFEST ACTION. <br />
              <span className="font-serif italic font-normal text-cyan-300">NOT JUST AN ACTION.</span>
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-xs">
              <span className="px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                PAYMENT LINK (Selected)
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">RETRY (Simulated)</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">REMINDER</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">STOP</span>
            </div>
          </motion.div>
        </div>

        {/* Chapter 04: POLICY */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="eyebrow-pill-dark mb-4 border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Chapter 04 · Policy Authority</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight leading-tight">
              The safety gate evaluates. <br />
              <span className="font-serif italic font-normal text-emerald-400">AI cannot bypass policy.</span>
            </h2>
            <div className="mt-8 grid sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                <span className="text-slate-400">OPTED OUT?</span>
                <span className="text-emerald-400 font-bold">NO · CLEAR</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                <span className="text-slate-400">COOLDOWN WINDOW?</span>
                <span className="text-emerald-400 font-bold">PASSED · CLEAR</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                <span className="text-slate-400">RETRY LIMIT CAP?</span>
                <span className="text-emerald-400 font-bold">1 / 3 · OK</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                <span className="text-slate-400">7-DAY WINDOW?</span>
                <span className="text-emerald-400 font-bold">2 DAYS · OK</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chapter 05: RECOVERY */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="eyebrow-pill-dark mb-4 border-cyan-500/30 text-cyan-300">
              <Zap className="w-3.5 h-3.5" />
              <span>Chapter 05 · Controlled Execution</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight leading-tight">
              Energy flows outward. <br />
              <span className="font-serif italic font-normal text-cyan-300">Recovery action active.</span>
            </h2>
            <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 font-mono text-xs text-slate-300 max-w-lg space-y-2">
              <p>ACTION DISPATCHED: Razorpay Payment Link</p>
              <p className="text-amber-300">STATUS: Pending Customer Settlement</p>
            </div>
          </motion.div>
        </div>

        {/* Chapter 06: VERIFIED */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="eyebrow-pill-dark mb-4 border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Chapter 06 · Verified Payoff</span>
            </div>
            <h2 className="text-5xl sm:text-7xl font-extrabold font-display tracking-tight leading-tight">
              RECOVERY VERIFIED. <br />
              <span className="font-serif italic font-normal text-emerald-400">
                ₹24,999
              </span> RECOVERED.
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-xs text-slate-400">
              <span className="text-rose-400">FAILED</span>
              <span>→</span>
              <span className="text-violet-400">DIAGNOSED</span>
              <span>→</span>
              <span className="text-cyan-300">DECIDED</span>
              <span>→</span>
              <span className="text-emerald-400">APPROVED</span>
              <span>→</span>
              <span className="text-amber-300">EXECUTED</span>
              <span>→</span>
              <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                VERIFIED
              </span>
            </div>
          </motion.div>
        </div>

      </section>


      {/* =========================================================================
          EDITORIAL PRODUCT SECTION 1: UNDERSTAND WHY PAYMENTS FAIL
          ========================================================================= */}
      <section className="py-32 px-6 sm:px-12 lg:px-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="max-w-3xl">
            <div className="eyebrow-pill-dark mb-4">
              <BrainCircuit className="w-3.5 h-3.5 text-violet-400" />
              <span>Diagnostic Telemetry</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight leading-tight">
              UNDERSTAND WHY <br />
              <span className="font-serif italic font-normal text-slate-300">PAYMENTS FAIL.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-400 font-light leading-relaxed">
              Every checkout failure contains hidden signals. Claude AI diagnoses error codes and transaction velocity to determine exact recoverability.
            </p>
          </motion.div>

          {/* Interactive Failure Cause Matrix */}
          <motion.div {...fadeInUp} className="mt-16">
            <div className="p-8 rounded-3xl bg-[#080B18] border border-white/15 shadow-2xl space-y-8">
              
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 pb-6 border-b border-white/10">
                {failureCauses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCauseId(c.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                      selectedCauseId === c.id 
                        ? 'bg-white text-[#050711] shadow-lg shadow-white/10' 
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
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
                    <currentCause.icon className="w-7 h-7 text-cyan-400" />
                    <div>
                      <h4 className="text-xl font-bold font-display text-white">{currentCause.name}</h4>
                      <span className="font-mono text-xs text-slate-400">{currentCause.code}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-light pt-2">
                    {currentCause.explanation}
                  </p>
                </div>

                <div className="lg:col-span-5 space-y-3 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400">Recoverability Score:</span>
                    <span className="text-violet-300 font-bold text-sm">
                      {Math.round(currentCause.recoverability * 100)}%
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400">AI Confidence:</span>
                    <span className="text-cyan-300 font-bold text-sm">
                      {Math.round(currentCause.confidence * 100)}%
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400">Candidate Playbook:</span>
                    <span className="text-white font-bold text-xs">{currentCause.playbook}</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>


      {/* =========================================================================
          EDITORIAL PRODUCT SECTION 2: 4-LAYER HIERARCHY
          ========================================================================= */}
      <section className="py-32 px-6 sm:px-12 lg:px-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="max-w-3xl">
            <div className="eyebrow-pill-dark mb-4">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Deterministic Architecture</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight leading-tight">
              THE SAFEST ACTION. <br />
              <span className="font-serif italic font-normal text-cyan-300">NOT JUST AN ACTION.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-400 font-light leading-relaxed">
              AI suggests. Deterministic playbooks map. Authoritative policies gate. Execution executes only when allowed.
            </p>
          </motion.div>

          <motion.div {...fadeInUp} className="mt-16 grid sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-6 rounded-3xl bg-[#080B18] border border-violet-500/20">
              <span className="text-[10px] uppercase font-bold text-violet-300">Layer 1</span>
              <h4 className="text-sm font-bold text-white mt-2">AI ADVISORY</h4>
              <p className="text-slate-400 mt-2 text-[11px] leading-relaxed font-light">
                Calculates root cause & probability score without mutating state.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#080B18] border border-cyan-500/20">
              <span className="text-[10px] uppercase font-bold text-cyan-300">Layer 2</span>
              <h4 className="text-sm font-bold text-white mt-2">DECISION ENGINE</h4>
              <p className="text-slate-400 mt-2 text-[11px] leading-relaxed font-light">
                Deterministic matrix selects candidate recovery action.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#080B18] border border-emerald-500/20">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Layer 3</span>
              <h4 className="text-sm font-bold text-white mt-2">POLICY GATE</h4>
              <p className="text-slate-400 mt-2 text-[11px] leading-relaxed font-light">
                Authoritative guardrails verify opt-out, cooldown, and retry caps.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#080B18] border border-white/15">
              <span className="text-[10px] uppercase font-bold text-white">Layer 4</span>
              <h4 className="text-sm font-bold text-white mt-2">SAFE EXECUTION</h4>
              <p className="text-slate-400 mt-2 text-[11px] leading-relaxed font-light">
                Razorpay payment link created. Verified via HMAC webhook.
              </p>
            </div>
          </motion.div>
        </div>
      </section>


      {/* =========================================================================
          EDITORIAL PRODUCT SECTION 3: RECOVER REVENUE WITHOUT LOSING CONTROL
          ========================================================================= */}
      <section className="py-32 px-6 sm:px-12 lg:px-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="eyebrow-pill-dark mb-4">
                <Layers3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Operational Control</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight leading-tight">
                RECOVER REVENUE <br />
                <span className="font-serif italic font-normal text-emerald-400">WITHOUT LOSING CONTROL.</span>
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
            <div className="p-6 rounded-3xl bg-[#080B18] border border-white/15">
              <span className="text-[10px] font-mono uppercase text-slate-400">Gross At Risk</span>
              <div className="text-2xl font-bold font-display text-white mt-1">
                <AnimatedCounter value={totalAtRisk} type="currencyShort" />
              </div>
              <span className="text-[10px] font-mono text-slate-500">Live Monitored</span>
            </div>

            <div className="p-6 rounded-3xl bg-[#080B18] border border-emerald-500/20">
              <span className="text-[10px] font-mono uppercase text-emerald-400">Total Recovered</span>
              <div className="text-2xl font-bold font-display text-emerald-400 mt-1">
                <AnimatedCounter value={totalRecovered} type="currencyShort" />
              </div>
              <span className="text-[10px] font-mono text-emerald-500/80">Verified Settled</span>
            </div>

            <div className="p-6 rounded-3xl bg-[#080B18] border border-cyan-500/20">
              <span className="text-[10px] font-mono uppercase text-cyan-400">Recovery Rate</span>
              <div className="text-2xl font-bold font-display text-cyan-400 mt-1">
                <AnimatedCounter value={recoveryRate} type="percent" />
              </div>
              <span className="text-[10px] font-mono text-cyan-500/80">Conversion</span>
            </div>

            <div className="p-6 rounded-3xl bg-[#080B18] border border-rose-500/20">
              <span className="text-[10px] font-mono uppercase text-rose-400">Failed Queue</span>
              <div className="text-2xl font-bold font-display text-rose-400 mt-1">
                <AnimatedCounter value={failedCount} type="number" />
              </div>
              <span className="text-[10px] font-mono text-rose-500/80">Active Queue</span>
            </div>

            <div className="p-6 rounded-3xl bg-[#080B18] border border-violet-500/20">
              <span className="text-[10px] font-mono uppercase text-violet-400">Recovered Count</span>
              <div className="text-2xl font-bold font-display text-violet-300 mt-1">
                <AnimatedCounter value={recoveredCount} type="number" />
              </div>
              <span className="text-[10px] font-mono text-violet-500/80">Settled Events</span>
            </div>
          </motion.div>
        </div>
      </section>


      {/* =========================================================================
          EDITORIAL PRODUCT SECTION 4: AI CAN RECOMMEND. POLICY DECIDES.
          ========================================================================= */}
      <section className="py-32 px-6 sm:px-12 lg:px-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="max-w-3xl">
            <div className="eyebrow-pill-dark mb-4 border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strict Governance</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight leading-tight">
              AI CAN RECOMMEND. <br />
              <span className="font-serif italic font-normal text-emerald-400">POLICY DECIDES.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-400 font-light leading-relaxed">
              Every candidate action must satisfy strict boundary rules before any customer communication or charge attempt occurs.
            </p>
          </motion.div>

          <motion.div {...fadeInUp} className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {safetyRules.map((s) => (
              <div key={s.rule} className="p-6 rounded-3xl bg-[#080B18] border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">{s.rule}</span>
                  <StatusBadge status={s.verdict} />
                </div>
                <div className="p-2 rounded-lg bg-black/40 text-cyan-300 text-[10px] border border-white/5">
                  {s.condition}
                </div>
                <p className="text-slate-400 text-[11px] font-light leading-relaxed">
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
      <section className="py-36 px-6 sm:px-12 text-center border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="eyebrow-pill-dark mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Living Financial Recovery</span>
            </div>

            <h2 className="text-5xl sm:text-7xl font-extrabold font-display tracking-tight leading-[0.98]">
              READY TO COMMAND <br />
              <span className="font-serif italic font-normal text-slate-300">
                YOUR RECOVERY ENGINE?
              </span>
            </h2>

            <p className="mt-6 text-slate-400 text-lg font-light max-w-xl mx-auto leading-relaxed">
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

export default EditorialProductLanding;
