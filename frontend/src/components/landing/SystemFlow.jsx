import React from 'react';
import { 
  AlertTriangle, 
  BrainCircuit, 
  BookOpen, 
  ShieldCheck, 
  Send, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

export function SystemFlow() {
  const steps = [
    {
      id: 'failed',
      icon: AlertTriangle,
      title: 'FAILED PAYMENT',
      desc: 'Gateway code & context ingested',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    },
    {
      id: 'ai',
      icon: BrainCircuit,
      title: 'AI DIAGNOSIS',
      desc: 'Claude evaluates failure root cause',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20'
    },
    {
      id: 'decision',
      icon: BookOpen,
      title: 'DECISION ENGINE',
      desc: 'Deterministic playbook candidate',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20'
    },
    {
      id: 'policy',
      icon: ShieldCheck,
      title: 'POLICY CHECK',
      desc: 'Authoritative guardrails (Allow/Block)',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20'
    },
    {
      id: 'action',
      icon: Send,
      title: 'RECOVERY ACTION',
      desc: 'Payment link or customer nudge',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      id: 'razorpay',
      icon: CreditCard,
      title: 'RAZORPAY',
      desc: 'Customer settles in Test Mode',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      id: 'recovered',
      icon: CheckCircle2,
      title: 'VERIFIED RECOVERY',
      desc: 'HMAC webhook settles ₹ revenue',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    }
  ];

  return (
    <div className="w-full py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase font-semibold">
          Architectural Lifecycle
        </span>
        <h3 className="text-2xl font-bold text-white mt-1">
          How RecoveryPilot Recovers Revenue
        </h3>
        <p className="text-sm text-slate-400 mt-2">
          From initial gateway failure ingestion to HMAC-verified gateway settlement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative flex flex-col items-center group">
              <div className={`w-full h-full p-4 rounded-2xl border ${step.border} ${step.bg} backdrop-blur-md flex flex-col items-center text-center transition-all duration-300 group-hover:scale-105 group-hover:border-opacity-60`}>
                <div className={`w-10 h-10 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${step.color}`} />
                </div>
                <span className="text-[11px] font-mono font-bold tracking-wider text-slate-200 uppercase mb-1">
                  {step.title}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  {step.desc}
                </span>
              </div>

              {/* Arrow Connector (hidden on last item and small screens) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
