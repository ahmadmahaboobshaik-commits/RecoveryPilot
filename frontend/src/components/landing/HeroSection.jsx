import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, HeartPulse, BrainCircuit, ShieldCheck, Zap } from 'lucide-react';
import GlassButton from '../ui/GlassButton';
import AnimatedCounter from '../ui/AnimatedCounter';

export function HeroSection({ metrics, onEnterCore, onOpenCommandCenter }) {
  const totalAtRisk = metrics?.total_at_risk || 0;
  const totalRecovered = metrics?.total_recovered || 0;
  const recoveryRate = metrics?.recovery_rate || 0;
  const failedCount = metrics?.failed_payment_count || 0;

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-4 sm:px-8 lg:px-14 pt-20 pb-16 overflow-hidden">
      
      <div className="max-w-7xl mx-auto w-full flex flex-col items-start z-10">
        
        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="eyebrow-pill-dark mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>The Living Recovery System</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl"
        >
          <h1 className="hero-headline-dark">
            PAYMENTS FAIL. <br />
            <span className="font-serif italic font-normal bg-gradient-to-r from-cyan-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
              REVENUE DOESN'T
            </span> HAVE TO.
          </h1>

          <p className="mt-8 text-lg sm:text-2xl text-slate-300 max-w-2xl font-light leading-relaxed">
            RecoveryPilot intelligently diagnoses, decides, protects and recovers failed payments through a living, verified lifecycle.
          </p>
        </motion.div>

        {/* Primary & Secondary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <GlassButton
            size="lg"
            variant="primary"
            onClick={onEnterCore}
            className="group"
          >
            ENTER RECOVERY CORE
            <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </GlassButton>

          <GlassButton
            size="lg"
            variant="secondary"
            onClick={onOpenCommandCenter}
          >
            <Zap className="w-4 h-4 text-cyan-400 mr-1.5" />
            VIEW COMMAND CENTER
          </GlassButton>
        </motion.div>

        {/* Real-time Telemetry Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 w-full max-w-4xl grid grid-cols-3 gap-6 pt-8 border-t border-white/10"
        >
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Gross At Risk
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              <AnimatedCounter value={totalAtRisk} type="currencyShort" />
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Live Monitored</span>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Recovered Revenue
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-emerald-400 mt-1">
              <AnimatedCounter value={totalRecovered} type="currencyShort" />
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Verified Settled</span>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Recovery Efficiency
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-cyan-400 mt-1">
              <AnimatedCounter value={recoveryRate} type="percent" />
            </div>
            <span className="text-[11px] text-slate-500 font-mono">{failedCount} Failed In Queue</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default HeroSection;
