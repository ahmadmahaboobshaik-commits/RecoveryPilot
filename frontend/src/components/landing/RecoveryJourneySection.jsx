import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShieldAlert, Search, GitBranch, ShieldCheck, Send, CheckCircle2, Activity } from 'lucide-react';

export function RecoveryJourneySection() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  const signalX = useTransform(scrollYProgress, [0.2, 0.8], ['0%', '82%'], { clamp: true });

  const steps = [
    {
      num: '01',
      title: 'FAILED',
      desc: 'Payment fails due to various reasons. We capture the signal instantly.',
      icon: ShieldAlert,
      color: 'text-[#7D4047]',
      bg: 'bg-[#7D4047]/10 border-[#7D4047]/20'
    },
    {
      num: '02',
      title: 'UNDERSTAND',
      desc: 'AI diagnoses failure root cause and evaluates recovery potential.',
      icon: Search,
      color: 'text-[#171717]',
      bg: 'bg-[#E5DED5]/50 border-[#6F6A64]/20'
    },
    {
      num: '03',
      title: 'DECIDE',
      desc: 'Best recovery action is selected using real-time policy + intelligence.',
      icon: GitBranch,
      color: 'text-[#171717]',
      bg: 'bg-[#E5DED5]/50 border-[#6F6A64]/20'
    },
    {
      num: '04',
      title: 'PROTECT',
      desc: 'Policy engine validates safety, eligibility and business rules.',
      icon: ShieldCheck,
      color: 'text-[#7D4047]',
      bg: 'bg-[#7D4047]/10 border-[#7D4047]/20'
    },
    {
      num: '05',
      title: 'RECOVER',
      desc: 'Intelligent recovery action is executed via secure payment links.',
      icon: Send,
      color: 'text-[#7D4047]',
      bg: 'bg-[#7D4047]/10 border-[#7D4047]/20'
    },
    {
      num: '06',
      title: 'VERIFY',
      desc: 'Payment is completed and verified. Revenue recovered.',
      icon: CheckCircle2,
      color: 'text-[#4A6B53]',
      bg: 'bg-[#4A6B53]/15 border-[#4A6B53]/30'
    }
  ];

  return (
    <section 
      id="journey-section" 
      ref={sectionRef} 
      className="py-32 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto z-10 relative text-[#171717]"
    >
      {/* Header */}
      <div className="space-y-3 mb-20 text-left">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7D4047]">
          THE RECOVERY JOURNEY
        </span>
        <h2 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-[#171717]">
          FROM FAILURE TO FULL RECOVERY
        </h2>
      </div>

      {/* Pipeline */}
      <div className="relative pt-8 pb-16">
        
        {/* Sweeping Burgundy Line */}
        <div className="absolute top-16 inset-x-8 h-0.5 bg-[#D8D0C7] z-0 hidden md:block">
          <div className="w-full h-full border-t border-dashed border-[#7D4047]/50" />
        </div>

        {/* Traveling Signal Node */}
        <div className="relative z-10 hidden md:block h-16">
          <motion.div
            style={{ left: signalX }}
            className="absolute -top-6 px-4 py-2 rounded-2xl bg-white border border-[#7D4047]/30 shadow-md flex items-center gap-2.5 font-mono text-xs text-[#171717]"
          >
            <Activity className="w-4 h-4 text-[#7D4047] animate-pulse" />
            <div>
              <span className="text-[10px] text-[#6F6A64] uppercase font-bold block">CURRENT SIGNAL</span>
              <span className="font-extrabold text-[#7D4047]">PAY_TEST_9042 · ₹24,999</span>
            </div>
          </motion.div>
        </div>

        {/* 6 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative z-10">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-5 rounded-3xl bg-white/70 backdrop-blur-md border border-[#D8D0C7]/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#7D4047]/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-[#6F6A64]">{step.num}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step.bg}`}>
                    <step.icon className={`w-4 h-4 ${step.color}`} />
                  </div>
                </div>

                <h3 className="font-display font-extrabold text-sm text-[#171717] tracking-tight">
                  {step.title}
                </h3>
              </div>

              <p className="text-[11px] text-[#6F6A64] leading-relaxed font-normal">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default RecoveryJourneySection;
