import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, CheckCircle, ArrowRight } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

export default function VesperPolicySection() {
  return (
    <section className="py-28 px-6 sm:px-12 lg:px-20 text-white relative z-10 bg-[#000000]">
      
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Editorial Headline & Copy */}
        <motion.div {...fadeInUp} className="lg:col-span-6 space-y-6">
          <div className="eyebrow-pill-framer">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>AUTHORITATIVE POLICY ENGINE</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            THE SAFEST ACTION.<br />
            <span className="font-serif-italic font-normal text-[#9A9A9A]">
              NOT JUST AN ACTION.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-[#9A9A9A] font-normal leading-relaxed">
            AI provides probabilistic diagnosis, but the deterministic Policy Engine guarantees compliance, cooldown windows, and customer protection before any recovery attempt is dispatched.
          </p>

          <div className="pt-2 font-mono text-sm text-cyan-400 font-bold tracking-wider uppercase">
            AI CAN RECOMMEND. POLICY DECIDES.
          </div>
        </motion.div>

        {/* Right Column: Minimal Safety Boundary Visualization */}
        <motion.div {...fadeInUp} className="lg:col-span-6">
          <div className="p-8 rounded-2xl bg-[#080808] border border-white/12 backdrop-blur-xl space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-xs text-[#9A9A9A]">
              <span>DETERMINISTIC EVALUATION PIPELINE</span>
              <span className="text-amber-400 font-bold">STRICT COMPLIANCE</span>
            </div>

            {/* Pipeline Steps */}
            <div className="space-y-4 font-mono text-xs">
              
              {/* Step 1: AI Recommendation */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#6F6F6F] uppercase block">1. AI RECOMMENDATION</span>
                  <span className="text-slate-200 font-bold block">INSTANT PAYMENT LINK</span>
                </div>
                <span className="text-xs text-cyan-400 font-bold">PROBABILITY: 85%</span>
              </div>

              {/* Step 2: Policy Verification Checks */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-3">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">2. POLICY ENGINE CHECKS</span>
                
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-[#9A9A9A]">OPTED OUT:</span>
                    <span className="text-emerald-400 font-bold">NO</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-[#9A9A9A]">COOLDOWN:</span>
                    <span className="text-emerald-400 font-bold">CLEAR</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-[#9A9A9A]">RETRY LIMIT:</span>
                    <span className="text-emerald-400 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-[#9A9A9A]">7-DAY CAP:</span>
                    <span className="text-emerald-400 font-bold">OK</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Final Execution Authorization */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-emerald-400 font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>3. AUTHORIZED EXECUTION</span>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40 text-[11px]">
                  PASSED DISPATCH
                </span>
              </div>

            </div>

          </div>
        </motion.div>

      </div>

    </section>
  );
}
