import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Layout, Monitor, ShieldCheck, Zap } from 'lucide-react';
import GlassButton from '../ui/GlassButton';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

export default function VesperProductShowcase({ onOpenCommandCenter }) {
  return (
    <section className="py-28 px-6 sm:px-12 lg:px-20 text-white relative z-10 bg-[#000000] border-t border-white/10">
      
      <div className="max-w-7xl mx-auto text-center space-y-12">
        
        {/* Header */}
        <motion.div {...fadeInUp} className="max-w-3xl mx-auto space-y-4">
          <div className="eyebrow-pill-framer">
            <Layout className="w-3.5 h-3.5 text-cyan-400" />
            <span>OPERATIONAL SURFACE</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            THE RECOVERY <span className="font-serif-italic font-normal text-[#9A9A9A]">COMMAND CENTER</span>
          </h2>

          <p className="text-base sm:text-lg text-[#9A9A9A] font-normal leading-relaxed">
            One operational surface for diagnosis, decisioning, policy enforcement, and verified settlement.
          </p>
        </motion.div>

        {/* Framed Product Screenshot Showcase */}
        <motion.div
          {...fadeInUp}
          className="relative max-w-6xl mx-auto rounded-3xl bg-[#080808] border border-white/16 p-3 sm:p-4 shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Browser / Frame Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#000000] rounded-2xl border border-white/10 mb-3 font-mono text-xs text-[#9A9A9A]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-slate-400">recovery-pilot.internal/command-center</span>
            </div>
            <span className="text-cyan-400 font-bold hidden sm:inline">LIVE RECOVERY ENGINE</span>
          </div>

          {/* Interactive Preview Surface Content */}
          <div className="relative rounded-2xl bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 text-left space-y-6">
            
            {/* Top Bar Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Autonomous Telemetry Matrix</h3>
                <p className="text-xs font-mono text-[#9A9A9A] mt-1">Ingesting 50 real-time payment signals from Razorpay API</p>
              </div>

              <button
                onClick={onOpenCommandCenter}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all self-start sm:self-auto cursor-pointer"
              >
                <span>ENTER COMMAND CENTER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mock Dashboard Surface Cards */}
            <div className="grid sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[#6F6F6F] block mb-1">LIVE DIAGNOSES</span>
                <span className="text-xl font-bold text-white block">50 ACTIVE</span>
                <span className="text-[11px] text-emerald-400 mt-2 block">100% Policy Compliant</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[#6F6F6F] block mb-1">SUCCESS VELOCITY</span>
                <span className="text-xl font-bold text-cyan-400 block">70.6% SETTLED</span>
                <span className="text-[11px] text-[#9A9A9A] mt-2 block">Avg 14min Resolution</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[#6F6F6F] block mb-1">RAZORPAY WEBHOOKS</span>
                <span className="text-xl font-bold text-emerald-400 block font-mono">VERIFIED</span>
                <span className="text-[11px] text-emerald-400 mt-2 block">Signature Authenticated</span>
              </div>
            </div>

          </div>
        </motion.div>

      </div>

    </section>
  );
}
