import React from 'react';

export function AuroraBackground({ children, className = '' }) {
  return (
    <div className={`relative min-h-screen bg-[#05070D] text-slate-100 overflow-hidden ${className}`}>
      {/* Aurora Ambient Blurred Orbs */}
      <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] rounded-full bg-violet-600/15 blur-[140px] pointer-events-none animate-aurora-float" />
      <div className="absolute top-[25%] right-[10%] w-[550px] h-[550px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none animate-aurora-float [animation-delay:4s]" />
      <div className="absolute bottom-[-10%] left-[30%] w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[160px] pointer-events-none animate-aurora-float [animation-delay:8s]" />

      {/* Grid Pattern Mesh Overlay */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

      {/* Top Subtle Gradient Light Beam */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Children Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
