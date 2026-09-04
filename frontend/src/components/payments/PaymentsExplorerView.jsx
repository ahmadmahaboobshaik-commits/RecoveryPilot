import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  WalletCards, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight
} from 'lucide-react';
import GlassButton from '../ui/GlassButton';
import StatusBadge from '../ui/StatusBadge';
import { api } from '../../services/api';
import { formatRupees } from '../../lib/formatters';

const FAILURE_CODES = [
  'INSUFFICIENT_FUNDS',
  'BANK_TIMEOUT',
  'CARD_EXPIRED',
  '3DS_AUTH_FAILED',
  'GATEWAY_ERROR',
  'CHECKOUT_ABANDONED',
  'UNKNOWN'
];

export function PaymentsExplorerView({ onSelectPayment }) {
  const [data, setData] = useState({ payments: [], total: 0 });
  const [query, setQuery] = useState({
    search: '',
    status: '',
    failure_code: '',
    limit: 20,
    offset: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = async (params = query) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPayments(params);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPayments({ ...query, offset: 0 });
    }, 280);
    return () => clearTimeout(handler);
  }, [query.search, query.status, query.failure_code]);

  useEffect(() => {
    fetchPayments(query);
  }, [query.offset]);

  return (
    <div className="space-y-6 pt-28 pb-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto z-10 relative text-[#F8F6F2] bg-[#171717]">
      
      {/* Primary Unmissable Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="eyebrow-pill-framer mb-3">
            <WalletCards className="w-3.5 h-3.5 text-[#7D4047]" />
            <span>LEDGER STREAM</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#F8F6F2]">
            PAYMENTS <span className="font-serif-italic font-normal text-[#7D4047]">PORTFOLIO</span>
          </h1>
          <p className="mt-2 text-base text-[#DDD5CD] font-normal max-w-2xl leading-relaxed opacity-90">
            Real-time query and recovery state inspection across all tracked payment transactions.
          </p>
        </div>

        <button
          onClick={() => fetchPayments(query)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium text-[#B7B0A8] bg-[#1C1B1A]/72 hover:bg-[#1C1B1A] border border-white/12 transition-all cursor-pointer static-icon"
        >
          <span>Refresh Stream</span>
          <RefreshCw className="w-3.5 h-3.5 text-[#B7B0A8] static-icon" />
        </button>
      </div>

      {/* Filter Bar - Translucent Glass */}
      <div className="p-4 rounded-2xl bg-[#1E1D1C]/80 border border-white/12 backdrop-blur-xl shadow-xl">
        <div className="grid sm:grid-cols-12 gap-3">
          
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#DDD5CD] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query.search}
              onChange={(e) => setQuery(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search by Payment ID or Customer ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.04] text-sm focus:outline-none focus:border-[#7D4047] focus:bg-white/[0.08] transition-all text-[#F8F6F2] placeholder:text-[#6F6A64] font-mono"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={query.status}
              onChange={(e) => setQuery(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-[#1E1D1C] text-sm focus:outline-none focus:border-[#7D4047] transition-all text-[#F8F6F2] font-mono cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="failed">Failed</option>
              <option value="abandoned">Abandoned</option>
              <option value="recovered">Recovered</option>
              <option value="exhausted">Exhausted</option>
            </select>
          </div>

          {/* Failure Code Filter */}
          <div className="sm:col-span-3">
            <select
              value={query.failure_code}
              onChange={(e) => setQuery(prev => ({ ...prev, failure_code: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-[#1E1D1C] text-sm focus:outline-none focus:border-[#7D4047] transition-all text-[#F8F6F2] font-mono cursor-pointer"
            >
              <option value="">All Failure Codes</option>
              {FAILURE_CODES.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-[#7D4047]/20 border border-[#7D4047]/40 text-rose-200 text-sm font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchPayments(query)} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* Table - Translucent Glass Container */}
      <div className="rounded-3xl bg-[#1E1D1C]/80 border border-white/12 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] font-bold uppercase tracking-wider text-[#DDD5CD]">
                <th className="py-3.5 px-6">Payment ID / Customer</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Failure Code</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Latest Action</th>
                <th className="py-3.5 px-4">Retries</th>
                <th className="py-3.5 px-6 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-[#DDD5CD]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#7D4047] mb-2" />
                    Streaming payment records...
                  </td>
                </tr>
              ) : data.payments.length > 0 ? (
                data.payments.map((p) => (
                  <tr
                    key={p.payment_id}
                    onClick={() => onSelectPayment(p.payment_id)}
                    className="hover:bg-white/[0.08] transition-colors cursor-pointer group text-sm"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#F8F6F2] group-hover:text-[#7D4047] transition-colors">
                        {p.payment_id}
                      </div>
                      <div className="text-xs text-[#6F6A64] mt-0.5 opacity-70">
                        {p.customer_id}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-white">
                      {formatRupees(p.amount)}
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-xs text-[#DDD5CD] bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/10">
                        {p.failure_code || 'UNKNOWN'}
                      </span>
                    </td>

                    <td className="py-4 px-4 capitalize text-[#DDD5CD] text-xs font-semibold">
                      {p.payment_method}
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={p.status} />
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-xs font-bold uppercase text-sky-400">
                        {p.latest_action || '—'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs text-[#6F6A64]">
                      {p.retry_count}/3
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-[#DDD5CD] group-hover:bg-[#7D4047] group-hover:text-white transition-all shadow-xs">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-[#6F6A64]">
                    No payment records match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-[#DDD5CD] font-mono">
          <span>
            Showing {data.payments.length} of {data.total} records
          </span>

          <div className="flex items-center gap-2">
            <GlassButton
              variant="secondary"
              size="sm"
              disabled={query.offset <= 0}
              onClick={() => setQuery(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
              icon={ChevronLeft}
            >
              Previous
            </GlassButton>

            <GlassButton
              variant="secondary"
              size="sm"
              disabled={query.offset + query.limit >= data.total}
              onClick={() => setQuery(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </GlassButton>
          </div>
        </div>
      </div>

    </div>
  );
}

export default PaymentsExplorerView;
