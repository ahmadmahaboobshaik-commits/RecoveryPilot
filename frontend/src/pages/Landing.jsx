import React, { useEffect, useState } from 'react';
import { AuroraBackground } from '../components/landing/AuroraBackground';
import { RevenuePreview } from '../components/landing/RevenuePreview';
import { SystemFlow } from '../components/landing/SystemFlow';
import { GlowButton } from '../components/ui/GlowButton';
import { api } from '../services/api';
import { 
  ArrowRight, 
  BrainCircuit, 
  ShieldCheck, 
  CreditCard, 
  FileCheck, 
  Zap,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

export function Landing({ onEnterCommandCenter }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLandingMetrics() {
      try {
        const data = await api.getMetrics();
        setMetrics(data);
      } catch (err) {
        console.warn('Backend metrics offline, using neutral preview state.');
      } finally {
        setLoading(false);
      }
    }
    fetchLandingMetrics();
  }, []);

  return (
    <AuroraBackground>
      {/* Top Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/30">
            <div className="w-full h-full bg-[#05070D] rounded-[11px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-violet-400 fill-violet-400/20" />
            </div>
          </div>
          <span className="font-bold text-lg text-white tracking-tight">RecoveryPilot</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Razorpay AI Buildathon</span>
          </div>

          <GlowButton 
            variant="secondary" 
            size="sm" 
            onClick={onEnterCommandCenter}
          >
            Launch App
          </GlowButton>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Text */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-mono font-semibold tracking-wider uppercase">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Track 3 — AI Revenue Recovery</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              AI REVENUE RECOVERY <br />
              <span className="text-gradient-aurora">COMMAND CENTER</span>
            </h1>

            <p className="text-xl font-bold font-mono text-cyan-400/90 tracking-wide uppercase">
              Detect. Diagnose. Recover. Prove.
            </p>

            <p className="text-base text-slate-300 max-w-xl leading-relaxed">
              RecoveryPilot turns failed payments into measurable recovery opportunities — using 
              Claude AI diagnosis, deterministic policy guardrails, and verified Razorpay Test Mode settlement.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <GlowButton 
                variant="primary" 
                size="lg" 
                icon={ArrowRight} 
                onClick={onEnterCommandCenter}
              >
                ENTER COMMAND CENTER
              </GlowButton>

              <a 
                href="#how-it-works"
                className="px-6 py-3.5 text-sm font-semibold rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-violet-500/30 transition-all"
              >
                SEE HOW IT WORKS
              </a>
            </div>

            {/* Trust Bullet Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-violet-400 shrink-0" />
                <span>AI Diagnosis</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Policy Guardrails</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Razorpay Webhooks</span>
              </div>
            </div>
          </motion.div>

          {/* Right Floating Revenue Card Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <RevenuePreview metrics={metrics} />
          </motion.div>
        </div>

        {/* System Flow Diagram */}
        <section id="how-it-works" className="pt-8">
          <SystemFlow />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#030509] py-8 text-center text-xs text-slate-500">
        <p>RecoveryPilot — Razorpay AI Buildathon 2026</p>
      </footer>
    </AuroraBackground>
  );
}

function SparklesIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}
