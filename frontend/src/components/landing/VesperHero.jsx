import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, ShieldCheck } from 'lucide-react';
import ThreeSceneCanvas from '../3d/ThreeSceneCanvas';

export default function VesperHero({ onOpenCommandCenter, onExplore }) {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between px-6 sm:px-12 lg:px-20 pt-32 pb-12 text-[#F8F6F2] overflow-hidden">
      
      {/* Layer 2: Architectural 3D Ambient Depth Canvas (Quiet mouse parallax in negative space) */}
      <ThreeSceneCanvas
        opacity={0.35}
        density="medium"
        showCore={true}
        className="opacity-80 pointer-events-none"
      />

      {/* Layer 7: Hero Content Container */}
      <div className="max-w-7xl mx-auto w-full my-auto py-6 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Editorial Headline & Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 space-y-7"
        >
          {/* Eyebrow Label */}
          <div className="eyebrow-pill-framer">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7D4047] animate-pulse" />
            <span>AI-POWERED PAYMENT RECOVERY</span>
          </div>

          {/* Vesper Editorial Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-[5.25rem] font-extrabold leading-[0.93] tracking-tight text-[#F8F6F2]">
            PAYMENTS FAIL.<br />
            <span className="font-serif-italic font-normal text-[#7D4047] tracking-normal">
              REVENUE DOESN'T
            </span><br />
            HAVE TO.
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-xl text-[#DDD5CD] max-w-xl font-normal leading-relaxed">
            RecoveryPilot turns failed payments into intelligent, policy-safe recovery opportunities.
          </p>

          {/* Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenCommandCenter}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold font-mono text-sm text-[#F8F6F2] bg-[#7D4047] hover:bg-[#8F4A52] border border-[#7D4047] shadow-[0_4px_20px_rgba(125,64,71,0.4)] transition-all cursor-pointer lift-hover"
            >
              <span>ENTER RECOVERY</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExplore}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-medium text-sm text-[#F8F6F2] bg-white/[0.04] hover:bg-white/[0.08] border border-white/12 backdrop-blur-xl transition-all cursor-pointer lift-hover"
            >
              <Play className="w-4 h-4 fill-current text-white/80" />
              <span>SEE HOW IT WORKS</span>
            </button>
          </div>

          {/* Operational Engine Status Indicator */}
          <div className="pt-4 flex items-center gap-2 text-xs font-mono text-[#6F6A64]">
            <span className="w-2 h-2 rounded-full bg-[#4A6B53] animate-ping" />
            <span className="text-[#34D399] font-semibold uppercase tracking-wider">● RECOVERY ENGINE ACTIVE</span>
            <span className="text-white/20">|</span>
            <span>POLICY ENGINE: AUTHORITATIVE</span>
          </div>

        </motion.div>

        {/* Right Column: Hero Floating Payment Signal Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 relative z-10"
        >
          {/* Restrained Floating Signal Interface */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="p-6 sm:p-7 rounded-2xl bg-[#1E1D1C]/90 backdrop-blur-2xl border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-6 relative overflow-hidden lift-hover"
          >
            {/* Header Signal Pill */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#7D4047] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#7D4047] animate-pulse" />
                <span>01 / PAYMENT SIGNAL CAPTURED</span>
              </div>
              <span className="text-[11px] text-[#6F6A64]">RAZORPAY GATEWAY</span>
            </div>

            {/* Signal Highlight Payload */}
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#DDD5CD] uppercase tracking-wider">TRANSACTION ID</span>
                <span className="text-sm font-bold text-[#F8F6F2] tracking-widest bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/10">
                  PAY_TEST_9042
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#DDD5CD] uppercase tracking-wider">AMOUNT AT RISK</span>
                <span className="text-2xl font-extrabold text-white">
                  ₹24,999
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#DDD5CD] uppercase tracking-wider">STATUS</span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#7D4047]/20 text-[#7D4047] border border-[#7D4047]/40">
                  PAYMENT FAILED
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#DDD5CD] uppercase tracking-wider">ROOT CAUSE</span>
                <span className="text-xs text-slate-300 font-medium">
                  INSUFFICIENT_FUNDS
                </span>
              </div>
            </div>

            {/* AI Diagnosis Indicator Pill */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between font-mono text-xs text-[#DDD5CD]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>DIAGNOSIS IN PROGRESS</span>
              </div>
              <span className="text-sky-400 font-bold">RECOVERABILITY: 85%</span>
            </div>

          </motion.div>
        </motion.div>

      </div>

    </section>
  );
}
