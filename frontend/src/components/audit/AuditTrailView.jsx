import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Search, 
  RefreshCw, 
  ArrowUpRight
} from 'lucide-react';
import GlassButton from '../ui/GlassButton';
import StatusBadge from '../ui/StatusBadge';
import { api } from '../../services/api';
import { formatDate } from '../../lib/formatters';

const STAGES = ['detected', 'diagnosed', 'action_taken', 'outcome', 'stopped'];

export function AuditTrailView({ onSelectPayment }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getActivity(200);
      setEvents(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch audit events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((e) => {
    const matchSearch = !search || 
      `${e.payment_id} ${e.event_id} ${e.reason} ${e.reference_id}`.toLowerCase().includes(search.toLowerCase());
    const matchStage = !selectedStage || e.stage === selectedStage;
    return matchSearch && matchStage;
  });

  return (
    <div className="space-y-6 pt-28 pb-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto z-10 relative text-[#F4F1EC] bg-[#11100F]">
      
      {/* Primary Unmissable Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="eyebrow-pill-framer mb-3">
            <ClipboardList className="w-3.5 h-3.5 text-[#7D4047]" />
            <span>FORENSIC MEMORY</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#F4F1EC]">
            RECOVERY FLIGHT <span className="font-serif-italic font-normal text-[#7D4047]">RECORDER</span>
          </h1>
          <p className="mt-2 text-base text-[#B7B0A8] font-normal max-w-2xl leading-relaxed">
            Immutable chronological ledger of diagnoses, policy checks, recovery actions, and webhook proofs.
          </p>
        </div>

        {/* STATIC Secondary Utility Control - NO ROTATION / ANIMATION */}
        <button
          onClick={fetchEvents}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium text-[#B7B0A8] bg-[#191817]/58 hover:bg-[#191817] border border-white/12 transition-all cursor-pointer static-icon"
        >
          <span>Sync Ledger</span>
          <RefreshCw className="w-3.5 h-3.5 text-[#B7B0A8] static-icon" />
        </button>
      </div>

      {/* Filter Bar - Translucent Glass */}
      <div className="p-4 rounded-2xl bg-[#191817]/58 border border-white/12 backdrop-blur-xl shadow-xl">
        <div className="grid sm:grid-cols-12 gap-3">
          
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-[#B7B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Payment ID, Event ID, Reference or Reason..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.03.5] text-sm focus:outline-none focus:border-[#7D4047] focus:bg-white/[0.08] transition-all text-[#F4F1EC] placeholder:text-[#817B75] font-mono"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-[#191817] text-sm focus:outline-none focus:border-[#7D4047] transition-all text-[#F4F1EC] font-mono cursor-pointer"
            >
              <option value="">All Recovery Stages</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-[#7D4047]/20 border border-[#7D4047]/40 text-rose-200 text-sm font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchEvents} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* Stream */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center text-sm text-[#B7B0A8] font-mono">
            Reading flight recorder ledger...
          </div>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((evt) => (
            <div
              key={evt.event_id}
              onClick={() => evt.payment_id && evt.payment_id !== 'unmatched' && onSelectPayment(evt.payment_id)}
              className="p-5 rounded-3xl bg-[#1C1B1A]/62 border border-white/12 backdrop-blur-xl shadow-md hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer group lift-hover"
            >
              <div className="grid md:grid-cols-12 gap-4 items-center font-mono">
                
                {/* Event & Payment IDs */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F4F1EC] group-hover:text-[#7D4047] transition-colors opacity-80">
                      {evt.payment_id}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#817B75] group-hover:text-[#7D4047] transition-colors" />
                  </div>
                  <span className="text-[10px] text-[#817B75] block mt-0.5 opacity-70">
                    {evt.event_id}
                  </span>
                </div>

                {/* Stage & Action */}
                <div className="md:col-span-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={evt.outcome || evt.stage} />
                  {evt.action && (
                    <span className="text-[10px] font-bold uppercase text-[#00A9C7] bg-[#00A9C7]/10 px-2 py-0.5 rounded border border-[#00A9C7]/20">
                      {evt.action}
                    </span>
                  )}
                </div>

                {/* Reasoning */}
                <div className="md:col-span-4">
                  <p className="text-xs text-[#B7B0A8] line-clamp-2 font-normal">
                    {evt.reason || 'Lifecycle telemetry recorded.'}
                  </p>
                </div>

                {/* Timestamp & Reference */}
                <div className="md:col-span-2 text-right">
                  <span className="text-[11px] text-[#F4F1EC] block font-medium">
                    {formatDate(evt.timestamp)}
                  </span>
                  {evt.reference_id && (
                    <span className="text-[10px] text-[#817B75] truncate block mt-0.5 opacity-70">
                      Ref: {evt.reference_id}
                    </span>
                  )}
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-sm text-[#817B75] font-mono">
            No audit events match your search criteria.
          </div>
        )}
      </div>

    </div>
  );
}

export default AuditTrailView;
