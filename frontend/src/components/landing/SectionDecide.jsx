import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GitBranch, ArrowDown, Check } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

export function SectionDecide() {
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

  const candidateActions = [
    { action: 'PAYMENT LINK (Razorpay Dynamic Link)', status: 'SELECTED', selected: true },
    { action: 'EMAIL DUNNING RETRY', status: 'DE-PRIORITIZED', selected: false },
    { action: 'SMS Duning REMINDER', status: 'DE-PRIORITIZED', selected: false }
  ];

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-36 overflow-hidden text-[#171717] border-t border-[#7D4047]/15 z-10 bg-transparent"
    >
      {/* Eyebrow */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="eyebrow-pill-framer">
          <GitBranch className="w-3.5 h-3.5 text-[#7D4047]" />
          <span>03 / DECIDE</span>
        </div>

        <span className="hidden sm:inline-block font-mono text-[11px] text-[#6F6A64] font-semibold uppercase tracking-wider">
          DECISION ENGINE LAYER
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
            THE RIGHT ACTION <br />
            <span className="serif-headline text-[#7D4047]">
              STARTS WITH THE RIGHT DECISION.
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-[#6F6A64] font-normal leading-relaxed max-w-lg">
            Decision Engine matches payment failure diagnostics against historical playbooks to select the optimal recovery action.
          </p>
        </motion.div>

        {/* Right Stage Visual 3: Decision Engine Pathway */}
        <motion.div 
          style={{ opacity: opacityStage, scale: scaleStage }}
          className="lg:col-span-6"
        >
          <div className="p-8 sm:p-10 rounded-[36px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_30px_70px_-15px_rgba(125,64,71,0.12)] space-y-8 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D8D0C7]/60 font-mono text-xs">
              <span className="text-[#6F6A64]">PAYMENT ID: PAY_TEST_9042</span>
              <StatusBadge status="decided" label="ACTION DECIDED" />
            </div>

            {/* Playbook Routing */}
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[10px] font-bold text-[#6F6A64] uppercase tracking-wider block">Candidate Playbook Selection</span>

              {candidateActions.map((item) => (
                <div 
                  key={item.action} 
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    item.selected 
                      ? 'bg-[#7D4047] text-[#F8F6F2] border-[#7D4047] shadow-md font-bold' 
                      : 'bg-[#F8F6F2]/80 border-[#D8D0C7]/60 text-[#6F6A64]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.selected && <Check className="w-4 h-4 text-[#F8F6F2]" />}
                    <span className="text-xs">{item.action}</span>
                  </div>
                  <span className="text-[11px] font-bold">{item.status}</span>
                </div>
              ))}
            </div>

            {/* Execution Schedule */}
            <div className="p-4 rounded-2xl bg-[#F8F6F2]/90 border border-[#D8D0C7]/80 flex items-center justify-between font-mono text-xs text-[#6F6A64]">
              <span>RECOMMENDED DISPATCH TIMING:</span>
              <span className="font-extrabold text-[#7D4047]">IMMEDIATE (0 MIN DELAY)</span>
            </div>

          </div>
        </motion.div>

      </div>

      {/* Bottom Bridge */}
      <motion.div 
        style={{ opacity: opacityBridge }}
        className="max-w-6xl mx-auto w-full pt-12 border-t border-[#7D4047]/15 flex items-center justify-between gap-4 text-xs font-mono text-[#6F6A64] relative z-10"
      >
        <span className="text-[#7D4047] font-bold">ACTION MATCHED: PAYMENT LINK GENERATION</span>
        <div className="flex items-center gap-1.5 text-[#171717] font-bold">
          <span>NEXT: 04 / PROTECT</span>
          <ArrowDown className="w-3.5 h-3.5 text-[#7D4047]" />
        </div>
      </motion.div>
    </section>
  );
}

export default SectionDecide;
