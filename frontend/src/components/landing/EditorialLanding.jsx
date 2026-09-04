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
  RefreshCw
} from 'lucide-react';
import LiquidGlass from '../ui/LiquidGlass';
import GlassButton from '../ui/GlassButton';
import AnimatedCounter from '../ui/AnimatedCounter';
import StatusBadge from '../ui/StatusBadge';
import { formatRupees, formatRupeesShort } from '../../lib/formatters';

const revealMotion = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

export function EditorialLanding({ metrics, activities = [], onOpenCommandCenter, onSelectPayment }) {
  const [activeCauseTab, setActiveCauseTab] = useState('timeout');

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
      recoverability: '85% High',
      confidence: '94% Deterministic',
      playbook: 'Automated Smart Retry',
      policy: 'Allowed (Cooldown Passed)',
      explanation: 'Temporary bank server degradation. Highly recoverable through paced algorithmic retries without customer friction.'
    },
    {
      id: 'funds',
      code: 'INSUFFICIENT_FUNDS',
      icon: CreditCard,
      name: 'Insufficient Balance',
      recoverability: '62% Medium',
      confidence: '89% AI Advisory',
      playbook: 'Timed Self-Service Link',
      policy: 'Allowed (Payday Cycle Check)',
      explanation: 'Customer account lacks liquidity. Deploys targeted payment link timed with recurring liquidity cycles.'
    },
    {
      id: 'expired',
      code: 'CARD_EXPIRED',
      icon: Ban,
      name: 'Card Expired',
      recoverability: '12% for Retry',
      confidence: '98% High',
      playbook: 'New Card Payment Link',
      policy: 'Allowed (Bypasses Retry Cap)',
      explanation: 'Card credentials obsolete. Instantly generates a secure checkout link allowing customer to input a new card.'
    },
    {
      id: '3ds',
      code: '3DS_AUTH_FAILED',
      icon: KeyRound,
      name: '3DS Auth Dropped',
      recoverability: '74% Medium-High',
      confidence: '91% AI Advisory',
      playbook: '1-Click Resume Link',
      policy: 'Allowed (Touch Count 1)',
      explanation: 'Customer missed OTP or biometric window. Direct resumption link allows immediate completion.'
    },
    {
      id: 'gateway',
      code: 'GATEWAY_ERROR',
      icon: ServerCrash,
      name: 'Processor Glitch',
      recoverability: '88% High',
      confidence: '96% High',
      playbook: 'Secondary Channel Retry',
      policy: 'Allowed (Circuit Breaker OK)',
      explanation: 'Intermittent payment gateway processing error. Alternate gateway routing achieves instant settlement.'
    }
  ];

  const safetyRules = [
    { rule: 'CUSTOMER OPTED OUT', condition: 'opted_out == True', verdict: 'BLOCKED', color: 'rose', desc: 'Strict compliance with customer communication preferences.' },
    { rule: '3-ATTEMPT RETRY CAP', condition: 'retry_count >= 3', verdict: 'BLOCKED', color: 'rose', desc: 'Prevents customer fatigue and gateway penalty flags.' },
    { rule: 'COOLDOWN WINDOW', condition: 'cooldown_hours < min', verdict: 'WAIT', color: 'amber', desc: 'Enforces minimum breathing space between touches.' },
    { rule: 'LOW AI CONFIDENCE', condition: 'confidence < 0.70', verdict: 'WAIT / FALLBACK', color: 'amber', desc: 'Deterministic fallback when AI confidence is insufficient.' },
    { rule: 'OUTSIDE RECOVERY WINDOW', condition: 'age_days > 7', verdict: 'BLOCKED', color: 'rose', desc: 'Prevents chasing stale checkout instances past relevance.' },
    { rule: 'POLICY APPROVED', condition: 'all_guardrails == PASS', verdict: 'EXECUTE', color: 'emerald', desc: 'Safe recovery action created (Razorpay link / reminder).' }
  ];

  return (
    <div className="relative z-10 w-full overflow-hidden text-white">

      {/* =========================================================================
          1. HERO SECTION (Editorial, Spacious, Confident)
          ========================================================================= */}
      <section className="relative min-h-[92vh] flex flex-col justify-between px-6 sm:px-12 lg:px-24 pt-28 pb-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow-pill-dark"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Autonomous Revenue Recovery</span>
          </motion.div>
        </div>

        <div className="max-w-5xl my-auto">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="hero-headline-dark"
          >
            PAYMENTS FAIL. <br />
            <span className="font-serif italic font-normal text-slate-300">
              REVENUE DOESN'T
            </span> <br />
            HAVE TO.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-lg sm:text-2xl text-slate-300 max-w-2xl font-light leading-relaxed"
          >
            RecoveryPilot diagnoses failed payments, chooses the safest recovery path, executes approved actions, and verifies recovered revenue through cryptographic proof.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
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

        {/* Real Telemetry Coordinates */}
        <div className="w-full grid grid-cols-3 gap-6 pt-8 border-t border-white/10 text-xs font-mono">
          <div>
            <span className="text-slate-500 uppercase tracking-wider block">Gross At Risk</span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              <AnimatedCounter value={totalAtRisk} type="currencyShort" />
            </div>
            <span className="text-slate-500">Live Monitored</span>
          </div>

          <div>
            <span className="text-emerald-400 uppercase tracking-wider block">Recovered Volume</span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-emerald-400 mt-1">
              <AnimatedCounter value={totalRecovered} type="currencyShort" />
            </div>
            <span className="text-slate-500">Verified Settled</span>
          </div>

          <div>
            <span className="text-cyan-400 uppercase tracking-wider block">Recovery Rate</span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-cyan-400 mt-1">
              <AnimatedCounter value={recoveryRate} type="percent" />
            </div>
            <span className="text-slate-500">{failedCount} Failed Queue</span>
          </div>
        </div>
      </section>


      {/* =========================================================================
          2. SCROLL STORYLINE (The 6-Stage Core Lifecycle)
          ========================================================================= */}
      <section id="storyline-start" className="space-y-40 py-24 px-6 sm:px-12 lg:px-24">
        
        {/* Step 1: Failed */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...revealMotion}>
            <div className="eyebrow-pill-dark mb-4 border-rose-500/30 text-rose-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>State 01 · Sensed Failure</span>
            </div>
            <h2 className="section-headline-dark">
              A payment fails. <br />
              <span className="font-serif italic font-normal text-rose-400">The Core senses it.</span>
            </h2>
            <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-sm">
              <span className="text-rose-400 font-bold">PAYMENT FAILED</span>
              <span className="text-slate-600">·</span>
              <span className="text-white text-xl font-display font-bold">₹24,999</span>
              <span className="text-slate-600">·</span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                INSUFFICIENT_FUNDS
              </span>
            </div>
            <p className="mt-6 text-slate-400 text-base font-light leading-relaxed max-w-xl">
              Failed payments are captured directly at the gateway layer. The Core begins active ingestion without customer disruption.
            </p>
          </motion.div>
        </div>

        {/* Step 2: Diagnosis */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...revealMotion}>
            <div className="eyebrow-pill-dark mb-4 border-violet-500/30 text-violet-300">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>State 02 · Diagnosis</span>
            </div>
            <h2 className="section-headline-dark">
              AI evaluates root causes. <br />
              <span className="font-serif italic font-normal text-violet-300">Advisory probability score.</span>
            </h2>
            <div className="mt-8 grid sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-slate-500 uppercase block">Root Cause</span>
                <span className="text-white font-bold text-sm block mt-1">INSUFFICIENT FUNDS</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-slate-500 uppercase block">Recoverability</span>
                <span className="text-violet-300 font-bold text-sm block mt-1">85% High</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-slate-500 uppercase block">Confidence</span>
                <span className="text-cyan-300 font-bold text-sm block mt-1">92% Deterministic</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Step 3: Decision */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...revealMotion}>
            <div className="eyebrow-pill-dark mb-4 border-cyan-500/30 text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>State 03 · Decision Engine</span>
            </div>
            <h2 className="section-headline-dark">
              Deterministic playbook. <br />
              <span className="font-serif italic font-normal text-cyan-300">The safest action selected.</span>
            </h2>
            <div className="mt-6 flex items-center gap-3 font-mono text-xs text-slate-300">
              <span className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                PAYMENT LINK (Active)
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">RETRY (Simulated)</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">REMINDER</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">STOP</span>
            </div>
          </motion.div>
        </div>

        {/* Step 4: Policy Gate */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...revealMotion}>
            <div className="eyebrow-pill-dark mb-4 border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>State 04 · Policy Gate</span>
            </div>
            <h2 className="section-headline-dark">
              The circular safety gate. <br />
              <span className="font-serif italic font-normal text-emerald-400">AI cannot bypass policy.</span>
            </h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                <span className="text-slate-400">OPTED OUT?</span>
                <span className="text-emerald-400 font-bold">NO · CLEAR</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                <span className="text-slate-400">COOLDOWN WINDOW?</span>
                <span className="text-emerald-400 font-bold">PASSED · CLEAR</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                <span className="text-slate-400">RETRY LIMIT?</span>
                <span className="text-emerald-400 font-bold">1 / 3 · OK</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                <span className="text-slate-400">7-DAY WINDOW?</span>
                <span className="text-emerald-400 font-bold">2 DAYS · OK</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Step 5: Recovery */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...revealMotion}>
            <div className="eyebrow-pill-dark mb-4 border-cyan-500/30 text-cyan-300">
              <Zap className="w-3.5 h-3.5" />
              <span>State 05 · Controlled Execution</span>
            </div>
            <h2 className="section-headline-dark">
              Energy flows outward. <br />
              <span className="font-serif italic font-normal text-cyan-300">Payment link created.</span>
            </h2>
            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-slate-300 max-w-lg">
              <p>CHANNEL: Razorpay Checkout Link</p>
              <p className="mt-1 text-amber-300">STATUS: Pending Customer Settlement</p>
            </div>
          </motion.div>
        </div>

        {/* Step 6: Verified Payoff */}
        <div className="max-w-4xl mx-auto">
          <motion.div {...revealMotion}>
            <div className="eyebrow-pill-dark mb-4 border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>State 06 · Verified Payoff</span>
            </div>
            <h2 className="hero-headline-dark text-4xl sm:text-6xl font-extrabold">
              RECOVERY VERIFIED. <br />
              <span className="font-serif italic font-normal text-emerald-400">
                ₹24,999
              </span> RECOVERED.
            </h2>
            <p className="mt-6 text-slate-300 font-light max-w-lg">
              Cryptographic Razorpay webhook signature verified. Revenue is confirmed and settles into the living core.
            </p>
          </motion.div>
        </div>

      </section>


      {/* =========================================================================
          3. FEATURE: INTELLIGENT DIAGNOSIS (Framer Style Product Visual)
          ========================================================================= */}
      <section className="py-28 px-6 sm:px-12 lg:px-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div {...revealMotion} className="max-w-3xl">
            <div className="eyebrow-pill-dark mb-4">
              <BrainCircuit className="w-3.5 h-3.5 text-violet-400" />
              <span>Diagnostic Intelligence</span>
            </div>
            <h2 className="section-headline-dark">
              UNDERSTAND WHY PAYMENTS FAIL.
            </h2>
            <p className="mt-6 text-lg text-slate-400 font-light leading-relaxed">
              Every failed payment has a root cause. Claude AI interprets gateway codes and customer transaction velocity to establish high-probability recovery paths.
            </p>
          </motion.div>

          {/* Interactive Diagnosis Explorer Visual Container */}
          <motion.div {...revealMotion} className="mt-14">
            <LiquidGlass className="p-8 border-white/15 bg-white/5 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse" />
                  <h3 className="text-base font-bold font-display text-white">Diagnostic Telemetry Matrix</h3>
                </div>
                <StatusBadge status="diagnosed" label="Advisory Mode Active" />
              </div>

              {/* Selector Tabs */}
              <div className="mt-6 flex flex-wrap gap-2">
                {failureCauses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCauseTab(c.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                      activeCauseTab === c.id 
                        ? 'bg-white text-[#050711] shadow-lg shadow-white/10' 
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Tab Display */}
              {(() => {
                const current = failureCauses.find(c => c.id === activeCauseTab) || failureCauses[0];
                return (
                  <div className="mt-8 p-6 rounded-2xl bg-black/40 border border-white/10 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <current.icon className="w-6 h-6 text-cyan-400" />
                        <div>
                          <h4 className="font-mono text-base font-bold text-white">{current.code}</h4>
                          <span className="text-xs text-slate-400">{current.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-bold">
                          Recoverability: {current.recoverability}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold">
                          Confidence: {current.confidence}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed font-light bg-white/5 p-4 rounded-xl border border-white/5">
                      {current.explanation}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                        <span className="text-[10px] font-mono font-bold uppercase text-violet-300">Playbook Mapping</span>
                        <p className="text-sm font-bold text-white mt-1">{current.playbook}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-300">Policy Guardrail Verdict</span>
                        <p className="text-sm font-bold text-white mt-1">{current.policy}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </LiquidGlass>
          </motion.div>
        </div>
      </section>


      {/* =========================================================================
          4. FEATURE: DECISION ENGINE (The Safest Action)
          ========================================================================= */}
      <section className="py-28 px-6 sm:px-12 lg:px-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div {...revealMotion} className="max-w-3xl">
            <div className="eyebrow-pill-dark mb-4">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Decision Engine</span>
            </div>
            <h2 className="section-headline-dark">
              THE SAFEST ACTION. <br />
              NOT JUST AN ACTION.
            </h2>
            <p className="mt-6 text-lg text-slate-400 font-light leading-relaxed">
              AI suggests. Deterministic logic maps. Policy authorizes. Execution follows only when every safety guardrail clears.
            </p>
          </motion.div>

          {/* 4-Layer Hierarchy Visual Flow */}
          <motion.div {...revealMotion} className="mt-14 grid sm:grid-cols-4 gap-4 font-mono text-xs">
            <LiquidGlass className="p-6 border-violet-500/20 bg-white/5">
              <span className="text-[10px] uppercase font-bold text-violet-300">Layer 1</span>
              <h4 className="text-sm font-bold text-white mt-2">AI ADVISORY</h4>
              <p className="text-slate-400 mt-2 text-[11px] leading-relaxed font-light">
                Calculates root cause & recoverability probability. Non-binding.
              </p>
            </LiquidGlass>

            <LiquidGlass className="p-6 border-cyan-500/20 bg-white/5">
              <span className="text-[10px] uppercase font-bold text-cyan-300">Layer 2</span>
              <h4 className="text-sm font-bold text-white mt-2">DECISION ENGINE</h4>
              <p className="text-slate-400 mt-2 text-[11px] leading-relaxed font-light">
                Deterministic matrix maps cause to candidate recovery playbook.
              </p>
            </LiquidGlass>

            <LiquidGlass className="p-6 border-emerald-500/20 bg-white/5">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Layer 3</span>
              <h4 className="text-sm font-bold text-white mt-2">POLICY GATE</h4>
              <p className="text-slate-400 mt-2 text-[11px] leading-relaxed font-light">
                Authoritative guardrails verify opt-out, cooldown, and 3-retry caps.
              </p>
            </LiquidGlass>

            <LiquidGlass className="p-6 border-white/10 bg-white/5">
              <span className="text-[10px] uppercase font-bold text-white">Layer 4</span>
              <h4 className="text-sm font-bold text-white mt-2">SAFE EXECUTION</h4>
              <p className="text-slate-400 mt-2 text-[11px] leading-relaxed font-light">
                Creates Razorpay test link. Revenue verified via HMAC webhook.
              </p>
            </LiquidGlass>
          </motion.div>
        </div>
      </section>


      {/* =========================================================================
          5. FEATURE: RECOVERY COMMAND CENTER (Live API Telemetry Preview)
          ========================================================================= */}
      <section className="py-28 px-6 sm:px-12 lg:px-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div {...revealMotion} className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="eyebrow-pill-dark mb-4">
                <Layers3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Operational Picture</span>
              </div>
              <h2 className="section-headline-dark">
                RECOVERY COMMAND CENTER
              </h2>
              <p className="mt-4 text-slate-400 text-base font-light">
                Real-time telemetry and revenue ledger streaming directly from your SQLite database.
              </p>
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

          {/* Spatial Live Metric Grid */}
          <motion.div {...revealMotion} className="mt-12 grid grid-cols-2 lg:grid-cols-5 gap-4">
            <LiquidGlass className="p-5 border-white/10 bg-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-400">Total At Risk</span>
              <div className="text-2xl font-bold font-display text-white mt-1">
                <AnimatedCounter value={totalAtRisk} type="currencyShort" />
              </div>
              <span className="text-[10px] font-mono text-slate-500">Gross Monitored</span>
            </LiquidGlass>

            <LiquidGlass className="p-5 border-emerald-500/20 bg-emerald-500/5">
              <span className="text-[10px] font-mono uppercase text-emerald-400">Total Recovered</span>
              <div className="text-2xl font-bold font-display text-emerald-400 mt-1">
                <AnimatedCounter value={totalRecovered} type="currencyShort" />
              </div>
              <span className="text-[10px] font-mono text-emerald-500/80">Verified Settled</span>
            </LiquidGlass>

            <LiquidGlass className="p-5 border-cyan-500/20 bg-cyan-500/5">
              <span className="text-[10px] font-mono uppercase text-cyan-400">Recovery Rate</span>
              <div className="text-2xl font-bold font-display text-cyan-400 mt-1">
                <AnimatedCounter value={recoveryRate} type="percent" />
              </div>
              <span className="text-[10px] font-mono text-cyan-500/80">Conversion</span>
            </LiquidGlass>

            <LiquidGlass className="p-5 border-rose-500/20 bg-rose-500/5">
              <span className="text-[10px] font-mono uppercase text-rose-400">Failed Queue</span>
              <div className="text-2xl font-bold font-display text-rose-400 mt-1">
                <AnimatedCounter value={failedCount} type="number" />
              </div>
              <span className="text-[10px] font-mono text-rose-500/80">Unrecovered</span>
            </LiquidGlass>

            <LiquidGlass className="p-5 border-violet-500/20 bg-violet-500/5">
              <span className="text-[10px] font-mono uppercase text-violet-400">Recovered Records</span>
              <div className="text-2xl font-bold font-display text-violet-300 mt-1">
                <AnimatedCounter value={recoveredCount} type="number" />
              </div>
              <span className="text-[10px] font-mono text-violet-500/80">Settled Events</span>
            </LiquidGlass>
          </motion.div>
        </div>
      </section>


      {/* =========================================================================
          6. FEATURE: SAFETY AUTHORITY MATRIX (AI CAN RECOMMEND. POLICY DECIDES.)
          ========================================================================= */}
      <section className="py-28 px-6 sm:px-12 lg:px-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div {...revealMotion} className="max-w-3xl">
            <div className="eyebrow-pill-dark mb-4 border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Deterministic Guardrails</span>
            </div>
            <h2 className="section-headline-dark">
              AI CAN RECOMMEND. <br />
              <span className="font-serif italic font-normal text-emerald-400">POLICY DECIDES.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-400 font-light leading-relaxed">
              Every candidate recovery action is held to strict business guardrails. The system knows when to wait and when to stop.
            </p>
          </motion.div>

          {/* Safety Matrix */}
          <motion.div {...revealMotion} className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {safetyRules.map((s) => (
              <LiquidGlass key={s.rule} className="p-5 border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">{s.rule}</span>
                  <StatusBadge status={s.verdict} />
                </div>
                <div className="mt-3 p-2 rounded-lg bg-black/40 text-cyan-300 text-[10px] border border-white/5">
                  {s.condition}
                </div>
                <p className="mt-3 text-slate-400 text-[11px] font-light leading-relaxed">
                  {s.desc}
                </p>
              </LiquidGlass>
            ))}
          </motion.div>
        </div>
      </section>


      {/* =========================================================================
          7. EDITORIAL CTA CLOSE
          ========================================================================= */}
      <section className="py-32 px-6 sm:px-12 text-center border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <motion.div {...revealMotion}>
            <div className="eyebrow-pill-dark mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>The Living Recovery Engine</span>
            </div>

            <h2 className="hero-headline-dark text-4xl sm:text-6xl font-extrabold">
              READY TO COMMAND <br />
              <span className="font-serif italic font-normal text-slate-300">
                YOUR RECOVERY LIFECYCLE?
              </span>
            </h2>

            <p className="mt-6 text-slate-400 text-lg font-light max-w-xl mx-auto leading-relaxed">
              Inspect live payment streams, trigger automated batch dry runs, and verify settled revenue.
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

export default EditorialLanding;
