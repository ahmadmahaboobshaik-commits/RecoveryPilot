import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AlertTriangle, Activity } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

export function SectionFailed() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  const yHeadline = useTransform(scrollYProgress, [0.15, 0.45], [48, 0], { clamp: true });
  const opacityHeadline = useTransform(scrollYProgress, [0.15, 0.40], [0, 1], { clamp: true });

  const opacitySignal = useTransform(scrollYProgress, [0.25, 0.50], [0, 1], { clamp: true });
  const scaleAmount = useTransform(scrollYProgress, [0.25, 0.55], [0.94, 1], { clamp: true });
  const signalPathX = useTransform(scrollYProgress, [0.25, 0.65], ['-100%', '0%'], { clamp: true });

  const opacityBridge = useTransform(scrollYProgress, [0.65, 0.88], [0, 1], { clamp: true });

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-24 py-36 overflow-hidden text-[#0F172A] border-t border-slate-900/10 z-10 bg-transparent"
    >
      {/* Top Header Eyebrow */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="eyebrow-pill-framer text-rose-600 border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>01 / FAILED</span>
        </div>

        <span className="hidden sm:inline-block font-mono text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
          SIGNAL DETECTION LAYER
        </span>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto w-full my-auto py-12 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Editorial Headline */}
        <motion.div 
          style={{ y: yHeadline, opacity: opacityHeadline }} 
          className="lg:col-span-6 space-y-6"
        >
          <h2 className="section-headline-framer">
            EVERY RECOVERY <br />
            <span className="font-serif italic font-normal text-rose-600">
              STARTS WITH A FAILURE.
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-lg">
            A failed payment is not the end of the transaction. It is the beginning of a recovery decision.
          </p>

          <div className="pt-4 flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-500" />
              <span>Real-Time Gateway Ingestion</span>
            </span>
          </div>
        </motion.div>

        {/* Right Product Visualization Stage (Translucent Glass for Visibility) */}
        <motion.div 
          style={{ opacity: opacitySignal, scale: scaleAmount }}
          className="lg:col-span-6"
        >
          <div className="p-8 sm:p-10 rounded-[32px] bg-white/90 backdrop-blur-md border border-slate-900/10 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.06)] relative overflow-hidden space-y-8">
            
            {/* Animated Signal Trace Line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-slate-100 overflow-hidden">
              <motion.div 
                style={{ x: signalPathX }}
                className="h-full w-full bg-gradient-to-r from-transparent via-rose-500 to-transparent" 
              />
            </div>

            {/* Transaction Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-[#0F172A]">pay_test_9042</span>
                  <span className="text-[10px] text-slate-400 block font-mono">Checkout Attempt #1</span>
                </div>
              </div>

              <StatusBadge status="failed" label="FAILED" />
            </div>

            {/* Prominent Amount */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Transaction Amount At Risk</span>
              <div className="text-4xl sm:text-5xl font-extrabold font-display text-[#0F172A]">
                ₹24,999
              </div>
            </div>

            {/* Gateway Response Telemetry */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 font-mono text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span>GATEWAY CODE:</span>
                <span className="text-rose-600 font-bold">INSUFFICIENT_FUNDS</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 text-[11px]">
                <span>ISSUER RESPONSE:</span>
                <span className="text-slate-700">Account balance below ticket threshold</span>
              </div>
            </div>

            {/* Bottom Status Footnote */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100">
              <span>CAPTURED AT GATEWAY</span>
              <span className="text-violet-600 font-bold">INGESTED FOR DIAGNOSIS →</span>
            </div>

          </div>
        </motion.div>

      </div>

      {/* Bottom Bridge */}
      <motion.div 
        style={{ opacity: opacityBridge }}
        className="max-w-6xl mx-auto w-full pt-12 border-t border-slate-900/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400 relative z-10"
      >
        <div className="flex items-center gap-2 text-violet-600 font-bold">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
          <span>TRANSITIONING TO DIAGNOSIS ENGINE</span>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span>NEXT: 02 / UNDERSTAND</span>
        </div>
      </motion.div>
    </section>
  );
}

export default SectionFailed;
