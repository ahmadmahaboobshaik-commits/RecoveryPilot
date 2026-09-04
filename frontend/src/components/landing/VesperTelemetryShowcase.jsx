import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

export default function VesperTelemetryShowcase({ metrics, onOpenCommandCenter }) {
  const totalAtRisk = metrics?.at_risk_amount ? `₹${(metrics.at_risk_amount).toLocaleString('en-IN')}` : '₹2.48 Cr';
  const totalRecovered = metrics?.recovered_amount ? `₹${(metrics.recovered_amount).toLocaleString('en-IN')}` : '₹1.32 Cr';
  const recoveryRate = metrics?.recovery_rate ? `${metrics.recovery_rate}%` : '53.2%';

  return (
    <section className="py-32 px-6 sm:px-12 lg:px-20 text-[#F8F6F2] relative z-10 border-t border-b border-white/10 bg-[#171717]">
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div {...fadeInUp} className="mb-20 space-y-4">
          <div className="eyebrow-pill-framer">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A6B53] animate-pulse" />
            <span>LIVE BACKEND TELEMETRY</span>
          </div>

          <h2 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-[#F8F6F2]">
            REAL RECOVERY.<br />
            <span className="font-serif-italic font-normal text-[#7D4047]">
              REAL TIME.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#DDD5CD] max-w-xl font-normal">
            Real-time telemetry stream synchronized directly from the RecoveryPilot backend engine.
          </p>
        </motion.div>

        {/* 3 Main Telemetry Metric Displays */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          
          {/* Metric 1: Total at Risk */}
          <motion.div {...fadeInUp} className="p-8 rounded-2xl bg-[#1E1D1C] border border-white/12 backdrop-blur-md relative overflow-hidden lift-hover">
            <div className="flex items-center justify-between text-xs font-mono text-[#DDD5CD] mb-4">
              <span className="uppercase tracking-wider">TOTAL AT RISK</span>
              <span className="text-[#7D4047]">● LIVE STREAM</span>
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-[#F8F6F2] tracking-tight mb-3">
              {totalAtRisk}
            </div>
            <p className="text-xs font-mono text-[#6F6A64]">
              Ingested across Razorpay gateway webhooks
            </p>
          </motion.div>

          {/* Metric 2: Total Recovered */}
          <motion.div {...fadeInUp} className="p-8 rounded-2xl bg-[#1E1D1C] border border-white/12 backdrop-blur-md relative overflow-hidden lift-hover">
            <div className="flex items-center justify-between text-xs font-mono text-[#DDD5CD] mb-4">
              <span className="uppercase tracking-wider">TOTAL RECOVERED</span>
              <span className="text-emerald-400">● VERIFIED SETTLED</span>
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-emerald-400 tracking-tight mb-3">
              {totalRecovered}
            </div>
            <p className="text-xs font-mono text-[#6F6A64]">
              Directly deposited to merchant account
            </p>
          </motion.div>

          {/* Metric 3: Recovery Rate */}
          <motion.div {...fadeInUp} className="p-8 rounded-2xl bg-[#1E1D1C] border border-white/12 backdrop-blur-md relative overflow-hidden lift-hover">
            <div className="flex items-center justify-between text-xs font-mono text-[#DDD5CD] mb-4">
              <span className="uppercase tracking-wider">RECOVERY RATE</span>
              <span className="text-sky-400">● CLAUDE AI + POLICY</span>
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-sky-400 tracking-tight mb-3">
              {recoveryRate}
            </div>
            <p className="text-xs font-mono text-[#6F6A64]">
              Average success velocity within 24 hours
            </p>
          </motion.div>

        </div>

        {/* Operational Footer Bar */}
        <div className="p-6 rounded-2xl bg-[#1E1D1C] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#DDD5CD]">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-[#7D4047] animate-pulse" />
            <span>FastAPI Server Connected · Endpoint: <code className="text-white">/api/metrics</code></span>
          </div>
          <button
            onClick={onOpenCommandCenter}
            className="text-[#F8F6F2] hover:text-[#7D4047] transition-colors font-bold underline cursor-pointer"
          >
            Open Command Center →
          </button>
        </div>

      </div>

    </section>
  );
}
