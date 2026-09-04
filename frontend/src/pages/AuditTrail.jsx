import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatDate } from '../lib/formatters';
import { FileText, RefreshCw, Filter, Search } from 'lucide-react';

export function AuditTrail({ onSelectPayment }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getActivity(100);
      setActivities(res.activities || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = activities.filter((act) => {
    const matchesSearch = !search || act.payment_id.toLowerCase().includes(search.toLowerCase()) || (act.reason && act.reason.toLowerCase().includes(search.toLowerCase()));
    const matchesStage = !stageFilter || act.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Audit Trail & Activity Log
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete immutable ledger of all recovery lifecycle events recorded in SQLite.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-aurora-surface border border-white/10">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter audit logs..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Stage:</span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
          >
            <option value="">All Stages</option>
            <option value="detected">Detected</option>
            <option value="diagnosed">Diagnosed</option>
            <option value="action_taken">Action Taken</option>
            <option value="outcome">Outcome</option>
            <option value="stopped">Stopped</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-aurora-surface border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">Payment ID</th>
                <th className="py-3.5 px-4 font-semibold">Stage</th>
                <th className="py-3.5 px-4 font-semibold">Action</th>
                <th className="py-3.5 px-4 font-semibold">Outcome</th>
                <th className="py-3.5 px-4 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No activity log entries found.
                  </td>
                </tr>
              ) : (
                filtered.map((log, idx) => (
                  <tr
                    key={log.event_id || idx}
                    onClick={() => onSelectPayment && onSelectPayment(log.payment_id)}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-bold text-white tracking-tight">
                      {log.payment_id}
                    </td>
                    <td className="py-3 px-4 uppercase text-slate-300">
                      {log.stage}
                    </td>
                    <td className="py-3 px-4 text-cyan-400 font-semibold uppercase">
                      {log.action || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={log.outcome || log.stage} />
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-sm truncate">
                      {log.reason || 'Lifecycle step logged'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
