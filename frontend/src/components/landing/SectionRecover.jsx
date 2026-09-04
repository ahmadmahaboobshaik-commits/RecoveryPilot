import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Send, ArrowDown, Clock } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

export function SectionRecover() {
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

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-36 overflow-hidden text-[#171717] border-t border-[#7D4047]/15 z-10 bg-transparent"
    >
      {/* Eyebrow */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="eyebrow-pill-framer">
          <Send className="w-3.5 h-3.5 text-[#7D4047]" />
          <span>05 / RECOVER</span>
        </div>

        <span className="hidden sm:inline-block font-mono text-[11px] text-[#6F6A64] font-semibold uppercase tracking-wider">
          CONTROLLED DISPATCH LAYER
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
            TURN FAILURE <br />
            <span className="serif-headline text-[#7D4047]">
              INTO RECOVERED REVENUE.
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-[#6F6A64] font-normal leading-relaxed max-w-lg">
            Recovery action dispatched safely. A personalized Razorpay payment link is generated and routed to the customer.
          </p>
        </motion.div>

        {/* Right Stage Visual 5: Gateway Recovery Dispatch */}
        <motion.div 
          style={{ opacity: opacityStage, scale: scaleStage }}
          className="lg:col-span-6"
        >
          <div className="p-8 sm:p-10 rounded-[36px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_30px_70px_-15px_rgba(125,64,71,0.12)] space-y-8 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D8D0C7]/60 font-mono text-xs">
              <span className="text-[#6F6A64]">PAYMENT ID: PAY_TEST_9042</span>
              <span className="font-bold text-[#7D4047]">DISPATCHED & ACTIVE</span>
            </div>

            {/* Dispatched Link Details */}
            <div className="p-5 rounded-2xl bg-[#7D4047]/10 border border-[#7D4047]/25 font-mono space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#171717]">Razorpay Payment Link</span>
                <StatusBadge status="executed" label="ACTIVE" />
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#D8D0C7]/80 text-xs font-bold text-[#7D4047] truncate">
                https://rzp.io/i/rec_pay_test_9042
              </div>

              <div className="flex justify-between items-center text-[11px] text-[#6F6A64]">
                <span>REFERENCE ID:</span>
                <span className="font-bold text-[#171717]">plink_test_9042_recovered</span>
              </div>
            </div>

            {/* Live Settlement Status */}
            <div className="p-4 rounded-2xl bg-[#F8F6F2]/90 border border-[#D8D0C7]/80 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2 text-[#7D4047] font-bold">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Awaiting Customer Checkout</span>
              </div>
              <span className="text-[10px] text-[#6F6A64]">Webhook Listener Active</span>
            </div>

          </div>
        </motion.div>

      </div>

      {/* Bottom Bridge */}
      <motion.div 
        style={{ opacity: opacityBridge }}
        className="max-w-6xl mx-auto w-full pt-12 border-t border-[#7D4047]/15 flex items-center justify-between gap-4 text-xs font-mono text-[#6F6A64] relative z-10"
      >
        <span className="text-[#4A6B53] font-bold">AWAITING HMAC WEBHOOK SETTLEMENT</span>
        <div className="flex items-center gap-1.5 text-[#171717] font-bold">
          <span>NEXT: 06 / VERIFY</span>
          <ArrowDown className="w-3.5 h-3.5 text-[#7D4047]" />
        </div>
      </motion.div>
    </section>
  );
}

export default SectionRecover;
