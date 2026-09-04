import React, { useState } from 'react';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { formatRupees, formatDate } from '../../lib/formatters';
import { Search, Filter, ChevronRight, AlertCircle } from 'lucide-react';
import { TableRowSkeleton } from '../ui/LoadingSkeleton';

export function PaymentTable({ payments = [], total = 0, loading = false, onSelectPayment, onSearch, onStatusFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  const handleStatusChange = (e) => {
    const val = e.target.value;
    setSelectedStatus(val);
    if (onStatusFilter) onStatusFilter(val);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-aurora-surface border border-white/10">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by Payment ID or Customer ID..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 font-mono transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-violet-500/50"
            >
              <option value="">All Statuses</option>
              <option value="failed">Failed</option>
              <option value="abandoned">Abandoned</option>
              <option value="recovered">Recovered</option>
              <option value="exhausted">Exhausted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Surface */}
      <div className="rounded-2xl bg-aurora-surface border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Payment ID</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                <th className="py-3.5 px-4 font-semibold">Failure Code</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold">Latest Action</th>
                <th className="py-3.5 px-4 font-semibold text-right">Created</th>
                <th className="py-3.5 px-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No payment records found matching criteria.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.payment_id}
                    onClick={() => onSelectPayment && onSelectPayment(p.payment_id)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-bold text-white tracking-tight">
                      {p.payment_id}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {p.customer_id}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-100">
                      {formatRupees(p.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px]">
                        {p.failure_code}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-cyan-400">
                      {p.latest_action ? p.latest_action.toUpperCase() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 text-[11px]">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors inline-block" />
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
