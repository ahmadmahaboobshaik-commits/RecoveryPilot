import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Radio } from 'lucide-react';
import GlassButton from '../ui/GlassButton';
import ThreeSceneCanvas from '../3d/ThreeSceneCanvas';

export function FramerHero({ metrics, onOpenCommandCenter, onExplore }) {
  const { scrollY } = useScroll();
  const yHeroText = useTransform(scrollY, [0, 500], [0, 30], { clamp: true });
  const scaleVis = useTransform(scrollY, [0, 600], [1, 0.97], { clamp: true });

  return (
    <section className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-20 pt-32 pb-16 overflow-hidden text-[#171717]">
      
      {/* Prominent Architectural Background */}
      <div className="absolute inset-0 z-0 hero-architectural-bg pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F6F2]/30 via-[#F8F6F2]/10 to-[#F8F6F2]/80" />
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto w-full my-auto py-8 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Editorial Copy */}
        <motion.div style={{ y: yHeroText }} className="lg:col-span-6 space-y-6">
          
          <div className="eyebrow-pill-framer">
            <span>AI-POWERED PAYMENT RECOVERY PLATFORM</span>
          </div>

          <h1 className="hero-headline-framer text-5xl sm:text-7xl font-extrabold leading-[0.95] tracking-tight text-[#171717]">
            PAYMENTS FAIL. <br />
            <span className="serif-headline text-[#7D4047]">
              REVENUE DOESN'T
            </span> <br />
            HAVE TO.
          </h1>

          <p className="text-base sm:text-xl text-[#6F6A64] max-w-lg font-normal leading-relaxed">
            RecoveryPilot turns failed payments into intelligent, policy-safe recovery opportunities.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <GlassButton
              size="lg"
              variant="primary"
              onClick={onOpenCommandCenter}
              className="group"
            >
              ENTER RECOVERY
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </GlassButton>

            <button
              onClick={onExplore}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-[#171717]/30 bg-[#F8F6F2]/80 backdrop-blur-md text-[#171717] text-sm font-semibold hover:bg-white transition-all cursor-pointer shadow-xs"
            >
              <Play className="w-4 h-4 fill-current text-[#7D4047]" />
              <span>SEE HOW IT WORKS</span>
            </button>
          </div>

        </motion.div>

        {/* Right Column: Hero Stage Visual 1 - Interactive 3D Model Stage */}
        <motion.div
          style={{ scale: scaleVis }}
          className="lg:col-span-6 relative"
        >
          <div className="p-6 sm:p-8 rounded-[36px] bg-slate-900 text-white border border-slate-800 shadow-[0_30px_70px_-15px_rgba(6,182,212,0.25)] space-y-6 relative overflow-hidden">
            
            {/* Header Signal Pill */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono text-xs z-10 relative">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Radio className="w-4 h-4 animate-pulse text-cyan-400" />
                <span>3D AI RECOVERY ENGINE</span>
              </div>
              <button
                onClick={() => window.location.hash = '3d-showcase'}
                className="text-[10px] text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 rounded-full hover:bg-cyan-500/30 transition-all font-mono font-bold"
              >
                FULL 3D MODE →
              </button>
            </div>

            {/* 3D Interactive Stage Canvas Container */}
            <div className="relative w-full h-[220px] rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden">
              <ThreeSceneCanvas speed={0.8} density="low" showCore={true} className="opacity-90" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 pointer-events-none">
                <span className="text-cyan-400 font-bold">REAL-TIME 3D MATRIX</span>
                <span>Move cursor to tilt camera</span>
              </div>
            </div>

            {/* Signal Highlight */}
            <div className="flex items-center justify-between z-10 relative">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">AI DIAGNOSIS SIGNAL</span>
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-cyan-400 block">PAY_TEST_9042</span>
                <span className="text-xs font-mono text-emerald-400 font-bold block">RECOVERY RATE: 98.4%</span>
              </div>

              <button
                onClick={onOpenCommandCenter}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
              >
                RESOLVE 3D →
              </button>
            </div>

          </div>
        </motion.div>

      </div>

    </section>
  );
}

export default FramerHero;
