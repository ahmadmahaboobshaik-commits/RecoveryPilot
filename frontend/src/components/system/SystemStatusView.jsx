import React from 'react';
import { 
  Server, 
  Database, 
  Bot, 
  CreditCard, 
  ShieldCheck, 
  KeyRound
} from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

export function SystemStatusView({ healthStatus = 'ok' }) {
  const isHealthy = healthStatus === 'ok';

  const systemComponents = [
    {
      name: 'FastAPI Backend Engine',
      status: isHealthy ? 'OPERATIONAL' : 'OFFLINE',
      icon: Server,
      endpoint: 'GET /health',
      desc: 'High-performance ASGI runtime serving deterministic recovery APIs.'
    },
    {
      name: 'SQLite Transaction Ledger',
      status: isHealthy ? 'OPERATIONAL' : 'OFFLINE',
      icon: Database,
      endpoint: 'recovery_pilot.db',
      desc: 'ACID storage for payments, audit recovery events, and batch runs.'
    },
    {
      name: 'Claude AI Diagnosis Engine',
      status: 'ADVISORY',
      icon: Bot,
      endpoint: 'Anthropic API',
      desc: 'Advisory intelligence calculating root cause and recoverability scores (non-executing).'
    },
    {
      name: 'Razorpay Payment Gateway',
      status: 'CONFIGURED',
      icon: CreditCard,
      endpoint: 'Test Mode Keys',
      desc: 'Generates secure dynamic payment links and verifies checkout settlement.'
    },
    {
      name: 'Cryptographic Webhook Ingestion',
      status: 'PROTECTED',
      icon: KeyRound,
      endpoint: 'POST /api/webhooks/razorpay',
      desc: 'HMAC-SHA256 signature verification preventing fraudulent status mutation.'
    },
    {
      name: 'Deterministic Policy Authority',
      status: 'ACTIVE',
      icon: ShieldCheck,
      endpoint: 'Policy Engine Gate',
      desc: 'Authoritative rules enforcing 3-touch caps, opt-out compliance, and cooldown windows.'
    }
  ];

  return (
    <div className="space-y-8 pt-28 pb-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto z-10 relative text-[#F8F6F2] bg-[#171717]">
      
      {/* Primary Unmissable Header */}
      <div>
        <div className="eyebrow-pill-framer mb-3">
          <Server className="w-3.5 h-3.5 text-[#7D4047]" />
          <span>INFRASTRUCTURE TELEMETRY</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#F8F6F2]">
          SYSTEM & SECURITY <span className="font-serif-italic font-normal text-[#7D4047]">ARCHITECTURE</span>
        </h1>
        <p className="mt-2 text-base text-[#DDD5CD] font-normal max-w-2xl leading-relaxed opacity-90">
          Observable system connectivity, security boundaries, and runtime integration status.
        </p>
      </div>

      {/* Grid of integrations - Frosted Translucent Glass Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemComponents.map((comp) => (
          <div
            key={comp.name}
            className="p-6 rounded-3xl bg-[#1E1D1C]/80 border border-white/12 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:bg-white/[0.08] hover:border-white/20 transition-all lift-hover"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.04] flex items-center justify-center text-[#7D4047] border border-white/10">
                  <comp.icon className="w-5 h-5 text-[#7D4047]" />
                </div>
                <StatusBadge status={comp.status} />
              </div>

              <h3 className="mt-4 text-base font-bold font-mono text-[#F8F6F2]">{comp.name}</h3>
              <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 inline-block mt-1">
                {comp.endpoint}
              </span>
              <p className="mt-3 text-xs text-[#DDD5CD] leading-relaxed font-normal opacity-85">
                {comp.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center text-[10px] font-mono text-[#6F6A64] font-semibold">
              <span>Security Guardrail Enforced</span>
            </div>
          </div>
        ))}
      </div>

      {/* Safety Guarantees - Frosted Glass Container */}
      <div className="p-8 rounded-[32px] bg-[#1E1D1C]/80 border border-white/12 backdrop-blur-xl shadow-2xl lift-hover">
        <h3 className="text-xl font-bold font-mono text-[#F8F6F2] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#34D399]" />
          <span>Core Safety Guarantees</span>
        </h3>
        
        <div className="mt-6 grid sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 font-mono">
            <h4 className="text-sm font-bold text-white">Zero Autonomous State Mutation</h4>
            <p className="text-xs text-[#DDD5CD] mt-1 leading-relaxed font-normal opacity-85">
              AI advice can never directly update payment recovery status or bypass deterministic policy gates.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 font-mono">
            <h4 className="text-sm font-bold text-white">Cryptographic Webhook Proof</h4>
            <p className="text-xs text-[#DDD5CD] mt-1 leading-relaxed font-normal opacity-85">
              Payments only transition to <span className="font-mono font-bold text-[#34D399]">RECOVERED</span> after cryptographic signature verification from Razorpay.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 font-mono">
            <h4 className="text-sm font-bold text-white">Client-Side Secret Isolation</h4>
            <p className="text-xs text-[#DDD5CD] mt-1 leading-relaxed font-normal opacity-85">
              API secrets, Anthropic keys, and Razorpay secrets remain securely isolated on the backend server.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default SystemStatusView;
