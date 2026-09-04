import React from 'react';
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
  ChevronDown,
  Lock,
  ArrowDown
} from 'lucide-react';
import GlassButton from '../ui/GlassButton';
import AnimatedCounter from '../ui/AnimatedCounter';

const sceneFade = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.35 },
  transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] }
};

export function CinematicExperience({ metrics, onOpenCommandCenter }) {
  const totalAtRisk = metrics?.total_at_risk || 0;
  const totalRecovered = metrics?.total_recovered || 0;
  const recoveryRate = metrics?.recovery_rate || 0;

  return (
    <div className="relative z-10 w-full">

      {/* =========================================================================
          SCENE 01 — FAILED (HERO)
          Opening screen: almost empty, deep dark environment, distant breathing core
          ========================================================================= */}
      <section className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-20 pt-28 pb-12">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="eyebrow-pill-dark"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Living Recovery Engine</span>
          </motion.div>
        </div>

        {/* Large Editorial Headline */}
        <div className="max-w-5xl my-auto">
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
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
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-lg sm:text-2xl text-slate-300 max-w-xl font-light leading-relaxed"
          >
            RecoveryPilot turns failed payment events into safe, explainable recovery actions through a living digital core.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
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
              ENTER THE RECOVERY CORE
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </GlassButton>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>CORE STATUS: BREATHING</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 animate-bounce">
            <span>SCROLL TO EXPLORE</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </section>


      {/* =========================================================================
          SCENE 02 — A PAYMENT FAILS
          Camera approaches. Coral particle enters the outer ring.
          Spatial floating text (NOT a giant card).
          ========================================================================= */}
      <section className="relative min-h-screen flex items-center justify-start px-6 sm:px-16 lg:px-24 py-24">
        <motion.div {...sceneFade} className="max-w-2xl">
          <div className="eyebrow-pill-dark mb-4 border-rose-500/30 text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Scene 02 · Transaction Dropped</span>
          </div>

          <h2 className="section-headline-dark">
            A payment fails. <br />
            <span className="font-serif italic font-normal text-rose-400">The Core senses it.</span>
          </h2>

          <div className="mt-8 space-y-4 font-mono text-sm">
            <div className="flex items-center gap-3 text-slate-300">
              <span className="text-slate-500 uppercase">Event:</span>
              <span className="text-rose-400 font-bold tracking-wider">PAYMENT FAILED</span>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <span className="text-slate-500 uppercase">Value At Risk:</span>
              <span className="text-white text-xl font-bold font-display">₹24,999</span>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <span className="text-slate-500 uppercase">Gateway Code:</span>
              <span className="text-slate-200 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                INSUFFICIENT_FUNDS
              </span>
            </div>
          </div>

          <p className="mt-8 text-sm text-slate-400 font-light leading-relaxed max-w-lg">
            The failed payment particle enters the outer liquid-glass ring. The structure shifts from ambient breathing to active sensing.
          </p>
        </motion.div>
      </section>


      {/* =========================================================================
          SCENE 03 — DIAGNOSIS
          Camera moves slightly around the Core. Particle travels toward center.
          Spatial floating telemetry labels (NO giant card grid).
          ========================================================================= */}
      <section className="relative min-h-screen flex items-center justify-end px-6 sm:px-16 lg:px-24 py-24">
        <motion.div {...sceneFade} className="max-w-2xl text-right sm:text-left">
          <div className="eyebrow-pill-dark mb-4 border-violet-500/30 text-violet-300">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span>Scene 03 · Advisory AI</span>
          </div>

          <h2 className="section-headline-dark">
            The particle travels inward. <br />
            <span className="font-serif italic font-normal text-violet-300">AI calculates root cause.</span>
          </h2>

          {/* Spatial Floating Diagnostic Telemetry */}
          <div className="mt-8 grid grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-slate-500 uppercase block">Root Cause</span>
              <span className="text-white font-bold text-sm block mt-1">INSUFFICIENT FUNDS</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-slate-500 uppercase block">Recoverability</span>
              <span className="text-violet-400 font-bold text-sm block mt-1">85% High</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-slate-500 uppercase block">Confidence</span>
              <span className="text-cyan-300 font-bold text-sm block mt-1">92% Deterministic</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-slate-500 uppercase block">Other Causes Sensed</span>
              <span className="text-slate-400 block mt-1 truncate">BANK TIMEOUT · 3DS AUTH · CARD EXPIRED</span>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-400 font-mono">
            Claude AI evaluates error codes & historical checkout velocity without mutating state.
          </p>
        </motion.div>
      </section>


      {/* =========================================================================
          SCENE 04 — DECISION
          Core reorganizes energy. 3 recovery paths appear.
          AI ADVICE -> DECISION ENGINE -> RECOVERY ACTION
          ========================================================================= */}
      <section className="relative min-h-screen flex items-center justify-start px-6 sm:px-16 lg:px-24 py-24">
        <motion.div {...sceneFade} className="max-w-2xl">
          <div className="eyebrow-pill-dark mb-4 border-cyan-500/30 text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Scene 04 · Deterministic Playbook</span>
          </div>

          <h2 className="section-headline-dark">
            Energy reorganizes. <br />
            <span className="font-serif italic font-normal text-cyan-300">A candidate is mapped.</span>
          </h2>

          {/* 3 Recovery Paths Stream */}
          <div className="mt-8 space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span>CHANNEL 1: RETRY</span>
              </div>
              <span className="text-[10px] text-slate-500">Simulated Only</span>
            </div>

            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-between text-cyan-300 shadow-lg shadow-cyan-500/10">
              <div className="flex items-center gap-2 font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>CHANNEL 2: PAYMENT LINK</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Selected Playbook</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span>CHANNEL 3: REMINDER</span>
              </div>
              <span className="text-[10px] text-slate-500">Secondary Fallback</span>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 font-mono text-xs text-slate-400">
            <span>AI ADVISES</span>
            <span className="text-cyan-400">→</span>
            <span>DECISION MAPS</span>
            <span className="text-cyan-400">→</span>
            <span className="text-white font-bold">POLICY CONTROLS</span>
          </div>
        </motion.div>
      </section>


      {/* =========================================================================
          SCENE 05 — POLICY GATE
          Circular translucent safety gate forms around Core.
          Verifies guardrails. Particle passes through.
          AI CANNOT BYPASS POLICY.
          ========================================================================= */}
      <section className="relative min-h-screen flex items-center justify-end px-6 sm:px-16 lg:px-24 py-24">
        <motion.div {...sceneFade} className="max-w-2xl text-right sm:text-left">
          <div className="eyebrow-pill-dark mb-4 border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Scene 05 · Authoritative Safety Gate</span>
          </div>

          <h2 className="section-headline-dark">
            The safety gate evaluates. <br />
            <span className="font-serif italic font-normal text-emerald-400">AI cannot bypass policy.</span>
          </h2>

          {/* Guardrail Checklist */}
          <div className="mt-8 space-y-2.5 font-mono text-xs">
            {[
              { check: 'CUSTOMER OPTED OUT?', verdict: 'NO · ALLOWED' },
              { check: 'COOLDOWN PERIOD?', verdict: 'NO · ALLOWED' },
              { check: 'RETRY LIMIT CAP?', verdict: '1 / 3 · OK' },
              { check: '7-DAY EXPIRATION WINDOW?', verdict: '2 DAYS OLD · OK' },
              { check: 'RECOVERABILITY THRESHOLD?', verdict: '85% >= 35% · PASSED' }
            ].map((item) => (
              <div key={item.check} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-slate-400">{item.check}</span>
                <span className="text-emerald-400 font-bold">{item.verdict}</span>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-slate-400 font-mono">
            Authoritative gate opens. Approved candidate action transitions to execution layer.
          </p>
        </motion.div>
      </section>


      {/* =========================================================================
          SCENE 06 — RECOVERY
          Approved particle leaves the Core outward.
          Action dispatched (Payment Link).
          ========================================================================= */}
      <section className="relative min-h-screen flex items-center justify-start px-6 sm:px-16 lg:px-24 py-24">
        <motion.div {...sceneFade} className="max-w-2xl">
          <div className="eyebrow-pill-dark mb-4 border-cyan-500/30 text-cyan-300">
            <Zap className="w-3.5 h-3.5" />
            <span>Scene 06 · Controlled Execution</span>
          </div>

          <h2 className="section-headline-dark">
            Energy flows outward. <br />
            <span className="font-serif italic font-normal text-cyan-300">Recovery action dispatched.</span>
          </h2>

          <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">DISPATCHED ACTION</span>
              <span className="text-cyan-400 font-bold uppercase">PAYMENT LINK</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">GATEWAY CHANNEL</span>
              <span className="text-white font-bold">Razorpay Checkout</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">EXECUTION STATUS</span>
              <span className="text-amber-300 font-bold uppercase">PENDING CUSTOMER SETTLEMENT</span>
            </div>
          </div>

          <p className="mt-8 text-sm text-slate-400 font-light leading-relaxed">
            Payment link generated. The transaction remains in pending recovery until cryptographic webhook proof arrives.
          </p>
        </motion.div>
      </section>


      {/* =========================================================================
          SCENE 07 — VERIFIED
          Verified emerald particle returns into the Core.
          Heart pulses and illuminates.
          Full journey payoff + CTA to enter Command Center.
          ========================================================================= */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 sm:px-12 py-24">
        <motion.div {...sceneFade} className="max-w-3xl flex flex-col items-center">
          
          <div className="eyebrow-pill-dark mb-6 border-emerald-500/40 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Scene 07 · Verified Outcome</span>
          </div>

          <h2 className="hero-headline-dark text-4xl sm:text-6xl font-extrabold">
            VERIFIED RECOVERY. <br />
            <span className="font-serif italic font-normal text-emerald-400">
              ₹24,999
            </span> RECOVERED.
          </h2>

          <p className="mt-6 text-base sm:text-lg text-slate-300 font-light max-w-xl leading-relaxed">
            Razorpay webhook signature verified. The recovery loop is complete and revenue returns to the living core.
          </p>

          {/* 6-Stage Journey Pathway */}
          <div className="mt-10 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] font-mono font-bold text-slate-300">
            <span className="text-rose-400">FAILED</span>
            <span className="text-slate-500">→</span>
            <span className="text-violet-400">DIAGNOSED</span>
            <span className="text-slate-500">→</span>
            <span className="text-cyan-300">DECIDED</span>
            <span className="text-slate-500">→</span>
            <span className="text-emerald-400">APPROVED</span>
            <span className="text-slate-500">→</span>
            <span className="text-amber-300">EXECUTED</span>
            <span className="text-slate-500">→</span>
            <span className="text-emerald-400 font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
              VERIFIED
            </span>
          </div>

          {/* Launch Command Center CTA */}
          <div className="mt-12">
            <GlassButton
              size="lg"
              variant="primary"
              onClick={onOpenCommandCenter}
              className="group"
            >
              LAUNCH COMMAND CENTER
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </GlassButton>
          </div>

        </motion.div>
      </section>

    </div>
  );
}

export default CinematicExperience;
