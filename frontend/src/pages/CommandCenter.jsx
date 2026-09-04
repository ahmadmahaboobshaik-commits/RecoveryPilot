import React, { useEffect, useState } from 'react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { BatchControl } from '../components/dashboard/BatchControl';
import { AgentActivity } from '../components/dashboard/AgentActivity';
import { FailureBreakdown } from '../components/dashboard/FailureBreakdown';
import { ActionBreakdown } from '../components/dashboard/ActionBreakdown';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { api } from '../services/api';
import { formatRupees, formatPercent } from '../lib/formatters';
import { 
  TrendingUp, 
  AlertTriangle, 
  Percent, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

export function CommandCenter({ onPaymentSelect }) {
  const [metrics, setMetrics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchRunning, setBatchRunning] = useState(false);
  const [lastBatchResult, setLastBatchResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [mRes, aRes] = await Promise.all([
        api.getMetrics(),
        api.getActivity(50)
      ]);
      setMetrics(mRes);
      setActivities(aRes.activities || []);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRunBatch = async (mode) => {
    setBatchRunning(true);
    try {
      const result = await api.runBatch(mode);
      setLastBatchResult(result);
      // Refresh dashboard data after batch completes
      await fetchData();
    } catch (err) {
      console.error('Batch run error:', err);
      alert(`Batch execution failed: ${err.message}`);
    } finally {
      setBatchRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const atRiskPaise = metrics?.total_at_risk || 0;
  const recoveredPaise = metrics?.total_recovered || 0;
  const rate = metrics?.recovery_rate || 0;
  const recoveredCount = metrics?.recovered_payment_count || 0;
  const pendingCount = metrics?.pending_recovery_count || 0;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              AI Revenue Recovery Command Center
            </h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              ● SYSTEM ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time observability and batch orchestration across SQLite payment lifecycle.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono border border-white/5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between font-mono">
          <span>⚠️ Backend connection issue: {error}</span>
          <button onClick={fetchData} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Dominant Revenue Recovered Card */}
        <MetricCard
          isDominant
          glow="violet"
          title="REVENUE RECOVERED"
          value={formatRupees(recoveredPaise)}
          subtitle={`${recoveredCount} payments settled via Razorpay webhooks`}
          icon={TrendingUp}
          trend={formatPercent(rate)}
          trendPositive={rate > 0}
        />

        {/* At Risk Card */}
        <MetricCard
          glow="none"
          title="TOTAL AT RISK"
          value={formatRupees(atRiskPaise)}
          subtitle="Failed or abandoned payment volume"
          icon={AlertTriangle}
        />

        {/* Recovery Rate Card */}
        <MetricCard
          glow="none"
          title="RECOVERY RATE"
          value={formatPercent(rate)}
          subtitle="Verified recovery success"
          icon={Percent}
          trendPositive
        />

        {/* Pending Recovery Card */}
        <MetricCard
          glow="none"
          title="PENDING RECOVERY"
          value={pendingCount}
          subtitle="Executed actions awaiting outcome"
          icon={Clock}
        />
      </div>

      {/* Batch Recovery Orchestrator Control Panel */}
      <BatchControl
        onRunBatch={handleRunBatch}
        isRunning={batchRunning}
        lastBatchResult={lastBatchResult}
      />

      {/* Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart metrics={metrics} />
        <FailureBreakdown metrics={metrics} />
      </div>

      {/* Action Performance & Agent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActionBreakdown metrics={metrics} />
        <AgentActivity activities={activities} />
      </div>
    </div>
  );
}
