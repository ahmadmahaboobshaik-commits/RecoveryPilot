import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import VesperHero from './VesperHero';
import VesperStoryline from './VesperStoryline';
import VesperTelemetryShowcase from './VesperTelemetryShowcase';
import VesperPolicySection from './VesperPolicySection';
import VesperProductShowcase from './VesperProductShowcase';

const fadeInUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

export default function VesperLanding({
  metrics,
  activities = [],
  onOpenCommandCenter,
  onSelectPayment
}) {
  const scrollToJourney = () => {
    const el = document.getElementById('journey-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative z-10 w-full overflow-hidden text-[#F8F6F2] bg-[#171717]">
      
      {/* Vesper Hero Stage */}
      <VesperHero
        onOpenCommandCenter={onOpenCommandCenter}
        onExplore={scrollToJourney}
      />

      {/* Product Section Headline Banner */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 border-t border-white/10 bg-[#1E1D1C] text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="eyebrow-pill-framer">
            <span>CORE RECOVERY INFRASTRUCTURE</span>
          </div>

          <h2 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-[#F8F6F2]">
            THE RECOVERY <span className="font-serif-italic text-[#7D4047]">ENGINE.</span>
          </h2>

          <p className="text-base sm:text-xl text-[#DDD5CD] font-normal max-w-2xl mx-auto leading-relaxed">
            Intelligence that understands failure, decides what to do next, and recovers revenue without breaking business rules.
          </p>
        </div>
      </section>

      {/* 6-Stage Narrative Storyline */}
      <VesperStoryline onOpenCommandCenter={onOpenCommandCenter} />

      {/* Live Dark Telemetry Showcase */}
      <VesperTelemetryShowcase
        metrics={metrics}
        onOpenCommandCenter={onOpenCommandCenter}
      />

      {/* Policy Engine Section */}
      <VesperPolicySection />

      {/* Command Center Product Showcase */}
      <VesperProductShowcase onOpenCommandCenter={onOpenCommandCenter} />

      {/* High-Impact Vesper Close CTA */}
      <section className="py-36 px-6 sm:px-12 text-center border-t border-white/10 bg-[#171717] relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp} className="space-y-8">
            <div className="eyebrow-pill-framer">
              <span className="w-2 h-2 rounded-full bg-[#7D4047] animate-ping" />
              <span>RECOVERY INFRASTRUCTURE IS LIVE</span>
            </div>

            <h2 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-[#F8F6F2] leading-none">
              READY TO COMMAND <br />
              <span className="font-serif-italic font-normal text-[#7D4047]">
                YOUR RECOVERY ENGINE?
              </span>
            </h2>

            <p className="text-base sm:text-lg text-[#DDD5CD] font-normal max-w-xl mx-auto leading-relaxed">
              Query payment streams, inspect AI failure diagnoses, execute dry runs, and verify settled revenue.
            </p>

            <div className="pt-4 flex items-center justify-center gap-4">
              <button
                onClick={onOpenCommandCenter}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold font-mono text-sm text-[#F8F6F2] bg-[#7D4047] hover:bg-[#8F4A52] border border-[#7D4047] shadow-[0_4px_25px_rgba(125,64,71,0.4)] transition-all cursor-pointer lift-hover"
              >
                <span>ENTER COMMAND CENTER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
