import React from 'react';
import { Bot, Zap, ShieldCheck } from 'lucide-react';
import GlassButton from '../ui/GlassButton';

export function CommandCenterPreviewSection({ onOpenCommandCenter }) {
  return (
    <section className="py-32 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto z-10 relative text-[#171717]">
      
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Copy & Feature Points */}
        <div className="lg:col-span-5 space-y-8 text-left">
          
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7D4047]">
              BUILT FOR MODERN BUSINESSES
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-[#171717]">
              COMPLETE RECOVERY <br />
              <span className="serif-headline font-normal text-[#7D4047]">COMMAND CENTER</span>
            </h2>
            <p className="text-base text-[#6F6A64] leading-relaxed font-normal">
              End-to-end recovery orchestration with AI intelligence, policy automation and real-time execution.
            </p>
          </div>

          {/* 3 Key Points */}
          <div className="space-y-6 pt-2">
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#7D4047]/10 border border-[#7D4047]/20 flex items-center justify-center text-[#7D4047] shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold font-mono text-xs uppercase text-[#171717]">AI-POWERED FAILURE DIAGNOSIS</h4>
                <p className="text-xs text-[#6F6A64] mt-0.5">Understand why payments fail in real time.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#7D4047]/10 border border-[#7D4047]/20 flex items-center justify-center text-[#7D4047] shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold font-mono text-xs uppercase text-[#171717]">INTELLIGENT RECOVERY ACTIONS</h4>
                <p className="text-xs text-[#6F6A64] mt-0.5">Choose the best recovery action automatically.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#7D4047]/10 border border-[#7D4047]/20 flex items-center justify-center text-[#7D4047] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold font-mono text-xs uppercase text-[#171717]">POLICY-FIRST PROTECTION</h4>
                <p className="text-xs text-[#6F6A64] mt-0.5">Business-safe recovery compliance guaranteed.</p>
              </div>
            </div>

          </div>

          <div className="pt-2">
            <GlassButton
              variant="primary"
              size="md"
              onClick={onOpenCommandCenter}
            >
              Open Command Center
            </GlassButton>
          </div>

        </div>

        {/* Right Column: Command Center UI Mockup Product Frame */}
        <div className="lg:col-span-7">
          <div className="rounded-[32px] bg-[#171717] p-3 shadow-[0_30px_70px_-15px_rgba(23,23,23,0.3)] border border-[#242424] overflow-hidden">
            
            {/* Window Header */}
            <div className="px-4 py-2.5 flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-slate-300 font-bold">RecoveryPilot Command Center</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase">Live Operations</span>
            </div>

            {/* Inner Dashboard Canvas */}
            <div className="bg-[#F8F6F2] rounded-2xl p-6 text-[#171717] font-sans space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#D8D0C7]/80">
                <div>
                  <h3 className="font-extrabold font-display text-lg">Command Center</h3>
                  <p className="text-xs text-[#6F6A64]">Real-time recovery operations overview</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#7D4047] bg-[#7D4047]/10 px-3 py-1 rounded-full border border-[#7D4047]/20">
                  SYSTEM ONLINE
                </span>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-white border border-[#D8D0C7]/80 shadow-xs">
                  <span className="text-[9px] text-[#6F6A64] font-bold block">Total At Risk</span>
                  <span className="text-base font-extrabold text-[#171717] block mt-0.5">₹2.48 Cr</span>
                  <span className="text-[9px] text-[#4A6B53] font-bold block mt-0.5">+12.8%</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#D8D0C7]/80 shadow-xs">
                  <span className="text-[9px] text-[#6F6A64] font-bold block">Recovered</span>
                  <span className="text-base font-extrabold text-[#4A6B53] block mt-0.5">₹1.32 Cr</span>
                  <span className="text-[9px] text-[#4A6B53] font-bold block mt-0.5">+16.7%</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#D8D0C7]/80 shadow-xs">
                  <span className="text-[9px] text-[#6F6A64] font-bold block">Recovery Rate</span>
                  <span className="text-base font-extrabold text-[#7D4047] block mt-0.5">53.2%</span>
                  <span className="text-[9px] text-[#4A6B53] font-bold block mt-0.5">+6.1%</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#D8D0C7]/80 shadow-xs">
                  <span className="text-[9px] text-[#6F6A64] font-bold block">Active Batches</span>
                  <span className="text-base font-extrabold text-[#171717] block mt-0.5">3</span>
                  <span className="text-[9px] text-[#6F6A64] block mt-0.5">In progress</span>
                </div>
              </div>

              {/* Trend Chart Mock */}
              <div className="grid grid-cols-12 gap-4 text-xs font-mono">
                <div className="col-span-7 p-4 rounded-2xl bg-white border border-[#D8D0C7]/80 space-y-2">
                  <span className="text-[10px] text-[#6F6A64] font-bold uppercase block">Recovery Trend</span>
                  <div className="h-28 w-full border-b border-slate-100 flex items-end justify-between px-2 pt-4">
                    {[35, 45, 60, 52, 75, 88, 92].map((val, idx) => (
                      <div key={idx} className="w-5 bg-[#7D4047]/20 hover:bg-[#7D4047] rounded-t transition-colors relative group" style={{ height: `${val}%` }}>
                        <div className="w-full h-1 bg-[#7D4047] rounded-t" />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#6F6A64]">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                  </div>
                </div>

                <div className="col-span-5 p-4 rounded-2xl bg-white border border-[#D8D0C7]/80 space-y-2">
                  <span className="text-[10px] text-[#6F6A64] font-bold uppercase block">Top Recovery Actions</span>
                  <div className="space-y-2 text-[10px]">
                    <div className="flex justify-between"><span>Payment Link</span><span className="font-bold text-[#7D4047]">42.1%</span></div>
                    <div className="flex justify-between"><span>Email Retry</span><span className="font-bold">22.7%</span></div>
                    <div className="flex justify-between"><span>Smart Dunning</span><span className="font-bold">18.3%</span></div>
                    <div className="flex justify-between"><span>UPI Intent</span><span className="font-bold">8.9%</span></div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

    </section>
  );
}

export default CommandCenterPreviewSection;
