import React, { useEffect, useState } from 'react';
import { PaymentTable } from '../components/payments/PaymentTable';
import { PaymentDetailsModal } from '../components/payments/PaymentDetailsModal';
import { api } from '../services/api';
import { CreditCard, RefreshCw } from 'lucide-react';

export function Payments() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await api.getPayments({ search, status, limit: 100 });
      setPayments(data.payments || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [search, status]);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Payments Explorer
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Inspect all synthetic payment records, failure causes, and recovery details stored in SQLite.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            Total: {total} Records
          </span>

          <button
            onClick={fetchPayments}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all"
            title="Refresh Table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Payment Table */}
      <PaymentTable
        payments={payments}
        total={total}
        loading={loading}
        onSelectPayment={(id) => setSelectedPaymentId(id)}
        onSearch={(term) => setSearch(term)}
        onStatusFilter={(st) => setStatus(st)}
      />

      {/* Payment Details Drawer Modal */}
      {selectedPaymentId && (
        <PaymentDetailsModal
          paymentId={selectedPaymentId}
          onClose={() => setSelectedPaymentId(null)}
        />
      )}
    </div>
  );
}
