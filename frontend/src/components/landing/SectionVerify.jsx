import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import GlassButton from '../ui/GlassButton';

export function SectionVerify({ onOpenCommandCenter }) {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  const yHeadline = useTransform(scrollYProgress, [0.15, 0.45], [48, 0], { clamp: true });
  const opacityHeadline = useTransform(scrollYProgress, [0.15, 0.40], [0, 1], { clamp: true });

  const opacityStage = useTransform(scrollYProgress, [0.25, 0.50], [0, 1], { clamp: true });
  const scaleStage = useTransform(scrollYProgress, [0.25, 0.55], [0.94, 1], { clamp: true });

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-36 overflow-hidden text-[#171717] border-t border-[#7D4047]/15 z-10 bg-transparent"
    >
      {/* Eyebrow */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="eyebrow-pill-framer">
          <CheckCircle2 className="w-4 h-4 text-[#4A6B53]" />
          <span>06 / VERIFY</span>
        </div>

        <span className="hidden sm:inline-block font-mono text-[11px] text-[#6F6A64] font-semibold uppercase tracking-wider">
          CRYPTOGRAPHIC PROOF LAYER
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
            RECOVERY VERIFIED. <br />
            <span className="serif-headline text-[#4A6B53]">
              ₹24,999 RECOVERED.
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-[#6F6A64] font-normal leading-relaxed max-w-lg">
            Cryptographic HMAC-SHA256 signature verification confirms customer settlement directly from Razorpay webhooks.
          </p>

          <div className="pt-4 flex items-center gap-2 text-xs font-mono text-[#4A6B53] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#4A6B53]" />
            <span>Verified Revenue Settlement Confirmed</span>
          </div>
        </motion.div>

        {/* Right Stage Visual 6: Verified Payoff Settlement */}
        <motion.div 
          style={{ opacity: opacityStage, scale: scaleStage }}
          className="lg:col-span-6"
        >
          <div className="p-8 sm:p-10 rounded-[36px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_30px_70px_-15px_rgba(74,107,83,0.15)] space-y-8 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D8D0C7]/60 font-mono text-xs">
              <span className="text-[#6F6A64] font-bold">PAYMENT ID: PAY_TEST_9042</span>
              <StatusBadge status="recovered" label="VERIFIED RECOVERED" />
            </div>

            {/* Payoff Value Display */}
            <div className="p-6 rounded-3xl bg-[#4A6B53]/10 border border-[#4A6B53]/30 text-center space-y-2">
              <span className="text-xs font-mono font-bold text-[#4A6B53] uppercase tracking-wider block">Total Settled Revenue</span>
              <div className="text-4xl sm:text-5xl font-extrabold font-display text-[#4A6B53]">
                ₹24,999
              </div>
              <span className="text-[11px] font-mono text-[#4A6B53] block">HMAC-SHA256 Signature Verified</span>
            </div>

            {/* Lifecycle Chain Summary */}
            <div className="space-y-2 font-mono text-xs">
              <span className="text-[10px] font-bold text-[#6F6A64] uppercase tracking-wider block">Full Lifecycle Audit Trail</span>
              <div className="p-4 rounded-2xl bg-[#F8F6F2]/90 border border-[#D8D0C7]/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-[#6F6A64]">
                <span className="text-[#7D4047]">FAILED</span>
                <span>→</span>
                <span className="text-[#171717]">DIAGNOSED</span>
                <span>→</span>
                <span className="text-[#171717]">DECIDED</span>
                <span>→</span>
                <span className="text-[#4A6B53]">APPROVED</span>
                <span>→</span>
                <span className="text-[#7D4047]">EXECUTED</span>
                <span>→</span>
                <span className="text-[#F8F6F2] bg-[#4A6B53] px-2 py-0.5 rounded border border-[#4A6B53] font-extrabold">
                  VERIFIED
                </span>
              </div>
            </div>

          </div>
        </motion.div>

      </div>

      {/* Bottom Footer Action */}
      <div className="max-w-6xl mx-auto w-full pt-12 border-t border-[#7D4047]/15 flex items-center justify-between font-mono text-xs text-[#6F6A64] relative z-10">
        <span>06 / 06 STORY COMPLETE</span>
        <GlassButton
          variant="primary"
          size="md"
          onClick={onOpenCommandCenter}
          icon={ArrowRight}
        >
          Enter Command Center
        </GlassButton>
      </div>
    </section>
  );
}

export default SectionVerify;
