import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import GlassButton from '../ui/GlassButton';
import FramerHero from './FramerHero';
import RecoveryJourneySection from './RecoveryJourneySection';
import SectionUnderstand from './SectionUnderstand';
import SectionDecide from './SectionDecide';
import SectionProtect from './SectionProtect';
import SectionRecover from './SectionRecover';
import SectionVerify from './SectionVerify';
import DarkShowcaseSection from './DarkShowcaseSection';
import CommandCenterPreviewSection from './CommandCenterPreviewSection';

const fadeInUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

export function FramerProductLanding({ 
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
    <div className="relative z-10 w-full overflow-hidden text-[#171717]">

      {/* Hero Section (Stage Visual 1: Ambient Signal Node) */}
      <FramerHero
        metrics={metrics}
        onOpenCommandCenter={onOpenCommandCenter}
        onExplore={scrollToJourney}
      />

      {/* Horizontal Recovery Journey (Timeline Node) */}
      <RecoveryJourneySection />

      {/* 6-Scene Evolving Storyline */}
      <div id="storyline-start" className="relative">
        
        {/* Scene 02 / UNDERSTAND (Stage Visual 2: Diagnostic Breakdown Matrix) */}
        <SectionUnderstand />

        {/* Scene 03 / DECIDE (Stage Visual 3: Decision Engine Pathway) */}
        <SectionDecide />

        {/* Scene 04 / PROTECT (Stage Visual 4: Policy Gate Boundary) */}
        <SectionProtect />

        {/* Scene 05 / RECOVER (Stage Visual 5: Gateway Recovery Dispatch) */}
        <SectionRecover />

        {/* Scene 06 / VERIFY (Stage Visual 6: Verified Payoff Settlement) */}
        <SectionVerify onOpenCommandCenter={onOpenCommandCenter} />

      </div>

      {/* Dark Showcase Section (World Map Telemetry Network) */}
      <DarkShowcaseSection
        metrics={metrics}
        onOpenCommandCenter={onOpenCommandCenter}
      />

      {/* Command Center Feature Product Preview Section */}
      <CommandCenterPreviewSection
        onOpenCommandCenter={onOpenCommandCenter}
      />

      {/* High-Impact Editorial Close CTA */}
      <section className="py-36 px-6 sm:px-12 text-center border-t border-[#7D4047]/15">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="eyebrow-pill-framer mb-6">
              <span className="w-2 h-2 rounded-full bg-[#7D4047] animate-ping" />
              <span>Living Financial Recovery System</span>
            </div>

            <h2 className="hero-headline-framer text-4xl sm:text-6xl font-extrabold text-[#171717]">
              READY TO COMMAND <br />
              <span className="serif-headline text-[#7D4047]">
                YOUR RECOVERY ENGINE?
              </span>
            </h2>

            <p className="mt-6 text-[#6F6A64] text-lg font-normal max-w-xl mx-auto leading-relaxed">
              Query the payment stream, inspect diagnoses, trigger batch dry runs, and verify settled revenue.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <GlassButton
                size="lg"
                variant="primary"
                onClick={onOpenCommandCenter}
                className="group"
              >
                ENTER COMMAND CENTER
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
              </GlassButton>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

export default FramerProductLanding;
