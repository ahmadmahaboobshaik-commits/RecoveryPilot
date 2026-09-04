import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, ArrowDown } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

export function SectionUnderstand() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  const yHeadline = useTransform(scrollYProgress, [0.15, 0.45], [48, 0], { clamp: true });
  const opacityHeadline = useTransform(scrollYProgress, [0.15, 0.40], [0, 1], { clamp: true });

  const opacityStage = useTransform(scrollYProgress, [0.25, 0.50], [0, 1], { clamp: true });
  const scaleStage = useTransform(scrollYProgress, [0.25, 0.55], [0.94, 1], { clamp: true });

  const opacityBridge = useTransform(scrollYProgress, [0.70, 0.90], [0, 1], { clamp: true });

  const candidateCauses = [
    { cause: 'INSUFFICIENT_FUNDS', prob: '85%', primary: true },
    { cause: 'EXPIRED_CARD', prob: '10%', primary: false },
    { cause: 'ISSUER_TIMEOUT', prob: '5%', primary: false }
  ];

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-36 overflow-hidden text-[#171717] border-t border-[#7D4047]/15 z-10 bg-transparent"
    >
      {/* Eyebrow */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="eyebrow-pill-framer">
          <Search className="w-3.5 h-3.5 text-[#7D4047]" />
          <span>02 / UNDERSTAND</span>
        </div>

        <span className="hidden sm:inline-block font-mono text-[11px] text-[#6F6A64] font-semibold uppercase tracking-wider">
          DIAGNOSTIC ENGINE LAYER
        </span>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto w-full my-auto py-12 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Headline */}
        <motion.div 
          style={{ y: yHeadline, opacity: opacityHeadline }} 
          className="lg:col-span-6 space-y-6"
        >
          <h2 className="section-headline-framer">
            EVERY FAILED PAYMENT <br />
            <span className="serif-headline text-[#7D4047]">
              HAS A REASON.
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-[#6F6A64] font-normal leading-relaxed max-w-lg">
            AI diagnoses the payment failure root cause, evaluates user intent, and calculates recovery probability.
          </p>
        </motion.div>

        {/* Right Stage Visual 2: Diagnostic Breakdown Matrix */}
        <motion.div 
          style={{ opacity: opacityStage, scale: scaleStage }}
          className="lg:col-span-6"
        >
          <div className="p-8 sm:p-10 rounded-[36px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_30px_70px_-15px_rgba(125,64,71,0.12)] space-y-8 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D8D0C7]/60 font-mono text-xs">
              <span className="text-[#6F6A64]">PAYMENT ID: PAY_TEST_9042</span>
              <StatusBadge status="diagnosed" label="DIAGNOSED" />
            </div>

            {/* Candidate Probabilities */}
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[10px] font-bold text-[#6F6A64] uppercase tracking-wider block">Root Cause Evaluation</span>

              {candidateCauses.map((item) => (
                <div 
                  key={item.cause} 
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    item.primary 
                      ? 'bg-[#7D4047]/10 border-[#7D4047]/30 text-[#171717] font-bold' 
                      : 'bg-[#F8F6F2]/80 border-[#D8D0C7]/60 text-[#6F6A64]'
                  }`}
                >
                  <span className="text-xs">{item.cause}</span>
                  <span className={`text-xs font-bold ${item.primary ? 'text-[#7D4047]' : 'text-[#6F6A64]'}`}>
                    {item.prob}
                  </span>
                </div>
              ))}
            </div>

            {/* Diagnostic Metrics */}
            <div className="grid grid-cols-2 gap-4 font-mono text-xs pt-2">
              <div className="p-4 rounded-2xl bg-[#F8F6F2]/90 border border-[#D8D0C7]/80">
                <span className="text-[10px] text-[#6F6A64] font-bold block">RECOVERABILITY</span>
                <span className="text-xl font-extrabold text-[#7D4047] block mt-0.5">85%</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#F8F6F2]/90 border border-[#D8D0C7]/80">
                <span className="text-[10px] text-[#6F6A64] font-bold block">AI CONFIDENCE</span>
                <span className="text-xl font-extrabold text-[#171717] block mt-0.5">92%</span>
              </div>
            </div>

          </div>
        </motion.div>

      </div>

      {/* Bottom Bridge */}
      <motion.div 
        style={{ opacity: opacityBridge }}
        className="max-w-6xl mx-auto w-full pt-12 border-t border-[#7D4047]/15 flex items-center justify-between gap-4 text-xs font-mono text-[#6F6A64] relative z-10"
      >
        <span className="text-[#7D4047] font-bold">ROOT CAUSE DETERMINED: INSUFFICIENT_FUNDS</span>
        <div className="flex items-center gap-1.5 text-[#171717] font-bold">
          <span>NEXT: 03 / DECIDE</span>
          <ArrowDown className="w-3.5 h-3.5 text-[#7D4047]" />
        </div>
      </motion.div>
    </section>
  );
}

export default SectionUnderstand;
