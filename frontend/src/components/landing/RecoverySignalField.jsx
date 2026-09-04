import React from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

export function RecoverySignalField() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Subtle Parallax (10px to 30px max)
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -30], { clamp: true });
  const opacityField = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.65, 0.75, 0.70, 0.40], { clamp: true });

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 opacity-60 select-none overflow-hidden">
        <img 
          src="/assets/editorial_architectural_bg.jpg" 
          alt="Atmosphere" 
          className="w-full h-full object-cover object-center filter blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7F8FA]/40 via-transparent to-[#F7F8FA]/60" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      
      {/* Clearly Visible Architectural Physical Background Layer */}
      <motion.div 
        style={{ y: yParallax, opacity: opacityField }}
        className="absolute inset-0 w-full h-[115%] -top-[5%]"
      >
        <img 
          src="/assets/editorial_architectural_bg.jpg" 
          alt="Architectural Atmosphere" 
          className="w-full h-full object-cover object-center filter blur-[0.5px] contrast-105 saturate-95"
        />
      </motion.div>

      {/* Subtle Cyan & Daylight Light Diffusion Gradient (Non-Blocking) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F7F8FA]/30 via-slate-900/[0.02] to-[#F7F8FA]/50" />

      {/* Fine Technical Grid Lines */}
      <div className="absolute inset-0 opacity-40">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="subtleGrid" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M 120 0 L 0 0 0 120" fill="none" stroke="rgba(15, 23, 42, 0.04)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#subtleGrid)" />
        </svg>
      </div>

    </div>
  );
}

export default RecoverySignalField;
