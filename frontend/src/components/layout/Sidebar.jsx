import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  BrainCircuit, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { clsx } from 'clsx';

export function Sidebar({ currentTab, setCurrentTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'decisions', label: 'AI Decisions', icon: BrainCircuit },
    { id: 'audit', label: 'Audit Trail', icon: FileText }
  ];

  return (
    <aside className="w-64 bg-aurora-surface/90 border-r border-white/5 flex flex-col justify-between p-4 sticky top-0 h-screen z-30 backdrop-blur-xl">
      <div className="space-y-6">
        {/* Brand Header */}
        <div 
          onClick={() => setCurrentTab('landing')}
          className="flex items-center gap-3 px-2 py-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-all">
            <div className="w-full h-full bg-aurora-bg rounded-[11px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-violet-400 fill-violet-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white group-hover:text-violet-300 transition-colors">
                RecoveryPilot
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-400/90 font-semibold block">
              AI Command Center
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <div className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-2">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={clsx(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white border border-violet-500/30 shadow-lg shadow-violet-900/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={clsx(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'
                  )} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-violet-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Landing Link */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <button
          onClick={() => setCurrentTab('landing')}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-violet-500/30 transition-all"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>View Landing Page</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        {/* Razorpay Test Mode Badge */}
        <div className="px-3 py-2 rounded-xl bg-aurora-card/60 border border-white/5 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-[11px] leading-tight">
            <div className="font-semibold text-slate-300">Razorpay Test Mode</div>
            <div className="text-slate-500 text-[10px]">Policy Controlled</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
