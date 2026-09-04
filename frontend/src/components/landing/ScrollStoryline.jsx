import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  BrainCircuit, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  RefreshCw, 
  Link2, 
  Clock, 
  Ban, 
  TrendingUp, 
  CreditCard,
  KeyRound,
  ServerCrash
} from 'lucide-react';
import LiquidGlass from '../ui/LiquidGlass';
import GlassButton from '../ui/GlassButton';
import AnimatedCounter from '../ui/AnimatedCounter';
import StatusBadge from '../ui/StatusBadge';

const fadeIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
};

export function ScrollStoryline({ metrics, onOpenCommandCenter }) {
  const [activeCause, setActiveCause] = useState('timeout');

  const causes = [
    {
      id: 'timeout',
      code: 'BANK_TIMEOUT',
      icon: Clock,
      name: 'Bank Timeout',
      score: '85%',
      playbook: 'Automated Smart Retry',
      policy: 'Allowed (Cooldown check)',
      detail: 'Temporary upstream gateway latency. Resolved via paced retry without bothering the customer.'
    },
    {
      id: 'funds',
      code: 'INSUFFICIENT_FUNDS',
      icon: CreditCard,
      name: 'Insufficient Balance',
      score: '62%',
      playbook: 'Timed Payment Link',
      policy: 'Allowed (Payday cycle window)',
      detail: 'Card lacks liquidity. Timed reminder deployed aligned with standard replenishment windows.'
    },
    {
      id: 'expired',
      code: 'CARD_EXPIRED',
      icon: Ban,
      name: 'Card Expired',
      score: '12% for retry',
      playbook: 'New Card Payment Link',
      policy: 'Allowed (Bypass retry counter)',
      detail: 'Card credentials obsolete. Instant self-service checkout link enables card update.'
    },
    {
      id: '3ds',
      code: '3DS_AUTH_FAILED',
      icon: KeyRound,
      name: '3DS Auth Dropped',
      score: '74%',
      playbook: '1-Click Resume Link',
      policy: 'Allowed (Touch count 1)',
      detail: 'Customer missed OTP or biometric challenge. Resumes authorization friction-free.'
    },
    {
      id: 'gateway',
      code: 'GATEWAY_ERROR',
      icon: ServerCrash,
      name: 'Gateway Glitch',
      score: '88%',
      playbook: 'Secondary Channel Retry',
      policy: 'Allowed (Circuit breaker safe)',
      detail: 'Intermittent processor error. Instant routing retry delivers immediate recovery.'
    }
  ];

  const safetyGates = [
    { title: 'Customer Opt-Out', rule: 'opted_out == True', status: 'BLOCK', desc: 'Strict respect for customer communication preferences.' },
    { title: '3-Attempt Hard Cap', rule: 'retry_count >= 3', status: 'BLOCK', desc: 'Prevents customer spam and fatigue after 3 touches.' },
    { title: 'Cooldown Window', rule: 'cooldown_hours < min', status: 'WAIT', desc: 'Ensures minimum breathing space between recovery touches.' },
    { title: '7-Day Expiration', rule: 'age_days > 7', status: 'STOP', desc: 'Stops chasing stale checkout instances past financial relevance.' },
    { title: 'Recoverability Bar', rule: 'recoverability >= 0.35', status: 'GATE', desc: 'Only commits resources to genuinely recoverable payments.' },
    { title: 'AI Confidence Gate', rule: 'confidence >= 0.70', status: 'GATE', desc: 'Deterministic fallback if AI confidence score is below threshold.' }
  ];

  return (
    <div id="core-story" className="relative space-y-40 py-24 px-4 sm:px-8 lg:px-14 z-10">
      
      {/* ------------------------------------------------
          STATE 1: FAILED
      ------------------------------------------------ */}
      <section className="max-w-6xl mx-auto">
        <motion.div {...fadeIn} className="max-w-3xl">
          <div className="eyebrow-pill-dark mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>State 01 · Sensed Failures</span>
          </div>
          <h2 className="section-headline-dark">
            Failed payments enter <br />
            <span className="font-serif italic font-normal text-rose-400">the living system.</span>
          </h2>
          <p className="mt-6 text-slate-300 text-lg leading-relaxed font-light">
            Every minute, transactions drop at checkout. RecoveryPilot continuously senses failures, capturing raw gateway error codes and transaction context.
          </p>
        </motion.div>

        {/* Live Problem Telemetry */}
        <div className="mt-12 grid sm:grid-cols-3 gap-5">
          <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
            <LiquidGlass className="border-rose-500/20 bg-white/5" glowColor="rgba(244, 63, 94, 0.2)">
              <div className="flex items-center justify-between text-rose-400">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider">At Risk Pool</span>
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="mt-4 text-3xl font-extrabold font-display text-white">
                <AnimatedCounter value={metrics?.total_at_risk || 0} type="currency" />
              </div>
              <p className="mt-2 text-xs text-slate-400 font-mono">Gross failing transaction value</p>
            </LiquidGlass>
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <LiquidGlass className="border-amber-500/20 bg-white/5" glowColor="rgba(245, 158, 11, 0.2)">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Failed Transactions</span>
                <Clock className="w-5 h-5" />
              </div>
              <div className="mt-4 text-3xl font-extrabold font-display text-white">
                <AnimatedCounter value={metrics?.failed_payment_count || 0} type="number" />
              </div>
              <p className="mt-2 text-xs text-slate-400 font-mono">Awaiting AI diagnosis</p>
            </LiquidGlass>
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
            <LiquidGlass className="border-violet-500/20 bg-white/5" glowColor="rgba(139, 92, 246, 0.2)">
              <div className="flex items-center justify-between text-violet-400">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Conversion Baseline</span>
                <Zap className="w-5 h-5" />
              </div>
              <div className="mt-4 text-3xl font-extrabold font-display text-white">
                <AnimatedCounter value={metrics?.recovery_rate || 0} type="percent" />
              </div>
              <p className="mt-2 text-xs text-slate-400 font-mono">Historical verified recovery</p>
            </LiquidGlass>
          </motion.div>
        </div>
      </section>


      {/* ------------------------------------------------
          STATE 2: DIAGNOSING
      ------------------------------------------------ */}
      <section className="max-w-6xl mx-auto">
        <motion.div {...fadeIn} className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <div className="eyebrow-pill-dark mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>State 02 · AI Diagnosis</span>
            </div>
            <h2 className="section-headline-dark">
              Particles are analyzed and categorized.
            </h2>
            <p className="mt-5 text-slate-300 text-base font-light leading-relaxed">
              Claude AI analyzes payment metadata, error codes, and customer payment velocity to calculate root cause and recoverability scores.
            </p>
          </div>

          <div className="lg:col-span-7">
            <LiquidGlass className="p-6 bg-white/5 border-white/10" glowColor="rgba(139, 92, 246, 0.25)">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-violet-300 font-display font-bold text-sm">
                  <BrainCircuit className="w-5 h-5" />
                  <span>Failure Reason Matrix</span>
                </div>
                <StatusBadge status="evaluating" label="AI Advisory" />
              </div>

              {/* Cause Selector Tabs */}
              <div className="mt-4 flex flex-wrap gap-2">
                {causes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCause(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                      activeCause === c.id 
                        ? 'bg-white text-[#050711] shadow-md shadow-white/10' 
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Active Cause Display */}
              {(() => {
                const current = causes.find(c => c.id === activeCause) || causes[0];
                return (
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <current.icon className="w-5 h-5 text-cyan-400" />
                        <div>
                          <h4 className="font-mono text-sm font-bold text-white">{current.code}</h4>
                          <span className="text-xs text-slate-400">{current.name}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                        Recoverability: {current.score}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                      {current.detail}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                        <span className="text-[10px] font-mono font-bold uppercase text-violet-300">Playbook Mapping</span>
                        <p className="text-xs font-bold text-white mt-0.5">{current.playbook}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-300">Policy Verdict</span>
                        <p className="text-xs font-bold text-white mt-0.5">{current.policy}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </LiquidGlass>
          </div>
        </motion.div>
      </section>


      {/* ------------------------------------------------
          STATE 3 & 4: DECISION & POLICY SAFETY GATE
      ------------------------------------------------ */}
      <section className="max-w-6xl mx-auto">
        <motion.div {...fadeIn} className="max-w-3xl">
          <div className="eyebrow-pill-dark mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>State 03 & 04 · The Safety Gate</span>
          </div>
          <h2 className="section-headline-dark">
            AI recommends. <br />
            <span className="font-serif italic font-normal text-emerald-400">Policy decides.</span>
          </h2>
          <p className="mt-5 text-slate-300 text-lg font-light leading-relaxed">
            AI is strictly advisory. Every single recovery candidate is verified against six deterministic guardrails before a single action is dispatched.
          </p>
        </motion.div>

        {/* 6 Policy Guardrails */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {safetyGates.map((gate, i) => (
            <motion.div key={gate.title} {...fadeIn} transition={{ delay: i * 0.06 }}>
              <LiquidGlass className="h-full p-5 border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">{gate.title}</span>
                  <StatusBadge status={gate.status} />
                </div>
                <div className="mt-3 font-mono text-[11px] bg-black/40 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/20 inline-block">
                  {gate.rule}
                </div>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed font-light">
                  {gate.desc}
                </p>
              </LiquidGlass>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ------------------------------------------------
          STATE 5 & 6: RECOVERY & VERIFIED PAYOFF
      ------------------------------------------------ */}
      <section className="max-w-6xl mx-auto">
        <motion.div {...fadeIn} className="max-w-3xl">
          <div className="eyebrow-pill-dark mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>State 05 & 06 · Verified Payoff</span>
          </div>
          <h2 className="section-headline-dark">
            Recovery isn't complete <br />
            <span className="font-serif italic font-normal text-cyan-400">until it's verified.</span>
          </h2>
          <p className="mt-5 text-slate-300 text-lg font-light leading-relaxed">
            Revenue is never booked when a link is sent or a retry attempted. Only cryptographic Razorpay webhook proof marks a transaction recovered.
          </p>
        </motion.div>

        {/* Payoff Banner */}
        <motion.div {...fadeIn} className="mt-12">
          <LiquidGlass className="p-8 sm:p-10 border-cyan-500/30 bg-gradient-to-br from-white/10 via-cyan-500/5 to-transparent">
            <div className="grid md:grid-cols-4 gap-6 text-center md:text-left">
              
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">State 1</span>
                <h4 className="mt-1 text-sm font-bold text-white">Payment Failed</h4>
                <p className="mt-1 text-[11px] text-slate-400">Captured at gateway</p>
              </div>

              <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-center">
                <span className="text-[10px] font-mono font-bold text-violet-300 uppercase">State 2</span>
                <h4 className="mt-1 text-sm font-bold text-white">Policy Approved</h4>
                <p className="mt-1 text-[11px] text-slate-400">Guarded recovery action</p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase">State 3</span>
                <h4 className="mt-1 text-sm font-bold text-white">Pending Settlement</h4>
                <p className="mt-1 text-[11px] text-slate-400">Customer completes link</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center shadow-lg shadow-emerald-500/10">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">State 4</span>
                <h4 className="mt-1 text-sm font-bold text-emerald-300">Verified Recovered</h4>
                <p className="mt-1 text-[11px] text-emerald-400 font-mono">Webhook HMAC Proof</p>
              </div>

            </div>

            <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold font-display text-white">Command the recovery lifecycle.</h3>
                <p className="text-xs text-slate-400 mt-1">Inspect real payment streams, execute batch dry runs, and verify settled revenue.</p>
              </div>
              <GlassButton size="lg" variant="primary" onClick={onOpenCommandCenter}>
                Launch Command Center
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </GlassButton>
            </div>
          </LiquidGlass>
        </motion.div>
      </section>

    </div>
  );
}

export default ScrollStoryline;
