import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Globe } from 'lucide-react';
import GlassButton from '../ui/GlassButton';

const fadeInUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

export function DarkShowcaseSection({ metrics, onOpenCommandCenter }) {
  const totalAtRisk = metrics?.total_at_risk || 0;
  const totalRecovered = metrics?.total_recovered || 0;
  const recoveryRate = metrics?.recovery_rate || 0;

  return (
    <section className="py-28 px-6 sm:px-12 lg:px-20 bg-[#171717] text-[#F8F6F2] border-y border-[#242424] z-10 relative overflow-hidden">
      
      {/* Ambient Burgundy Glow Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#7D4047]/20 via-[#E5DED5]/5 to-transparent blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Telemetry Highlights */}
        <motion.div {...fadeInUp} className="lg:col-span-6 space-y-8">
          
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7D4047]">
              LIVE RECOVERY INTELLIGENCE
            </span>
            <h2 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-[#F8F6F2]">
              REAL RECOVERY. <br />
              <span className="serif-headline font-normal text-[#E5DED5]">REAL TIME.</span>
            </h2>
          </div>

          {/* 3 Metric Columns */}
          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10 font-mono">
            <div>
              <span className="text-[10px] uppercase text-[#6F6A64] font-bold block">TOTAL AT RISK</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#F8F6F2] mt-1">
                ₹2.48 Cr
              </div>
              <span className="text-[10px] text-[#6F6A64] block mt-0.5">across 1,842 payments</span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-[#6F6A64] font-bold block">TOTAL RECOVERED</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#4A6B53] mt-1">
                ₹1.32 Cr
              </div>
              <span className="text-[10px] text-[#4A6B53]/80 block mt-0.5">recovered successfully</span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-[#6F6A64] font-bold block">RECOVERY RATE</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#7D4047] mt-1">
                53.2%
              </div>
              <span className="text-[10px] text-[#7D4047]/80 block mt-0.5">industry performance</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <GlassButton
              variant="secondary"
              size="md"
              onClick={onOpenCommandCenter}
              icon={LayoutGrid}
              className="bg-[#242424] text-[#F8F6F2] border-white/20 hover:bg-white hover:text-[#171717]"
            >
              VIEW LIVE COMMAND CENTER
            </GlassButton>
          </div>

        </motion.div>

        {/* Right World Map Signal Network Visualization */}
        <motion.div {...fadeInUp} className="lg:col-span-6 relative">
          <div className="p-8 rounded-[36px] bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden space-y-6">
            
            {/* World Map SVG Arc Graphics */}
            <div className="relative w-full h-64 flex items-center justify-center">
              <Globe className="w-48 h-48 stroke-1 stroke-white/10 text-transparent" />
              
              {/* Pulsing Nodes */}
              <div className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-[#7D4047] animate-ping" />
              <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-[#7D4047] animate-ping" />
              <div className="absolute bottom-1/3 left-1/2 w-3 h-3 rounded-full bg-[#4A6B53] animate-ping" />

              {/* Connecting Arcs */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 120 80 Q 220 20 320 120" fill="none" stroke="#7D4047" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 220 160 Q 340 80 420 100" fill="none" stroke="#4A6B53" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#6F6A64] pt-4 border-t border-white/10">
              <span>GLOBAL RECOVERY NETWORK</span>
              <span className="text-[#4A6B53] font-bold">HMAC VERIFIED SETTLEMENTS</span>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default DarkShowcaseSection;
