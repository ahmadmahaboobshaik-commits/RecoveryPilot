import React from 'react';
import { ArrowRight } from 'lucide-react';

export function FloatingNav({ activePage = 'landing', onNavigate, backendHealth = 'ok' }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#171717]/85 backdrop-blur-2xl border-b border-white/10 px-6 sm:px-12 py-4 flex items-center justify-between transition-all">
      
      {/* RecoveryPilot Brand Logo Wordmark */}
      <button
        onClick={() => onNavigate('landing')}
        className="flex items-center gap-2.5 cursor-pointer group text-left"
      >
        <div className="w-6 h-6 rounded-md bg-[#7D4047]/20 border border-[#7D4047]/40 flex items-center justify-center font-mono font-bold text-xs text-[#7D4047] group-hover:bg-[#7D4047]/30 transition-all">
          RP
        </div>
        <span className="font-extrabold text-lg tracking-tight text-[#F8F6F2]">
          Recovery<span className="font-serif-italic font-normal text-[#7D4047]">Pilot</span>
        </span>
      </button>

      {/* Center Nav Links */}
      <div className="hidden lg:flex items-center gap-7 text-xs font-mono font-medium text-[#DDD5CD]">
        <button
          onClick={() => onNavigate('landing')}
          className={`hover:text-white transition-colors cursor-pointer ${activePage === 'landing' ? 'text-white font-bold' : ''}`}
        >
          Product
        </button>

        <button
          onClick={() => {
            const el = document.getElementById('journey-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="hover:text-white transition-colors cursor-pointer"
        >
          How It Works
        </button>

        <button
          onClick={() => onNavigate('decisions')}
          className={`hover:text-white transition-colors cursor-pointer ${activePage === 'decisions' ? 'text-white font-bold' : ''}`}
        >
          Workbench
        </button>

        <button
          onClick={() => onNavigate('batch')}
          className={`hover:text-white transition-colors cursor-pointer ${activePage === 'batch' ? 'text-white font-bold' : ''}`}
        >
          Batch Engine
        </button>

        <button
          onClick={() => onNavigate('audit')}
          className={`hover:text-white transition-colors cursor-pointer ${activePage === 'audit' ? 'text-white font-bold' : ''}`}
        >
          Audit Trail
        </button>

        <button
          onClick={() => onNavigate('system')}
          className={`hover:text-white transition-colors cursor-pointer ${activePage === 'system' ? 'text-white font-bold' : ''}`}
        >
          System Status
        </button>
      </div>

      {/* Right Action CTA */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('command')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold text-[#F8F6F2] bg-[#7D4047] hover:bg-[#8F4A52] border border-[#7D4047] shadow-[0_4px_15px_rgba(125,64,71,0.35)] transition-all cursor-pointer lift-hover"
        >
          <span>ENTER RECOVERY</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </header>
  );
}

export default FloatingNav;
