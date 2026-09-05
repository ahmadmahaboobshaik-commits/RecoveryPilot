/**
 * Utility functions for formatting financial values, numbers, dates, and statuses.
 */

// Formats amount in paise to Indian Rupees string (1 INR = 100 paise)
export function formatRupees(paise) {
  if (paise === null || paise === undefined || isNaN(paise)) return '₹0.00';
  const rupees = paise / 100.0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(rupees);
}

// Compact rupee format (e.g., ₹4.39L or ₹43.9K)
export function formatRupeesShort(paise) {
  if (paise === null || paise === undefined || isNaN(paise)) return '₹0';
  const rupees = paise / 100.0;
  if (rupees >= 10000000) {
    return `₹${(rupees / 10000000).toFixed(2)}Cr`;
  }
  if (rupees >= 100000) {
    return `₹${(rupees / 100000).toFixed(2)}L`;
  }
  if (rupees >= 1000) {
    return `₹${(rupees / 1000).toFixed(1)}K`;
  }
  return `₹${rupees.toFixed(0)}`;
}

// Formats percentage score
export function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return '0.0%';
  return `${Number(value).toFixed(1)}%`;
}

// Formats ISO timestamp to human readable format
export function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(d);
  } catch (err) {
    return isoString;
  }
}

// Formats relative time (e.g. "2m ago")
export function formatRelativeTime(isoString) {
  if (!isoString) return '—';
  try {
    const now = new Date();
    const d = new Date(isoString);
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 10) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  } catch (err) {
    return isoString;
  }
}

// Standardized status configuration
export function getStatusConfig(status) {
  const s = (status || 'unknown').toLowerCase();

  switch (s) {
    case 'recovered':
      return {
        label: 'RECOVERED',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400'
      };
    case 'executed':
      return {
        label: 'EXECUTED',
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        dot: 'bg-cyan-400'
      };
    case 'pending':
      return {
        label: 'PENDING',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400 animate-pulse'
      };
    case 'failed':
      return {
        label: 'FAILED',
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        dot: 'bg-rose-400'
      };
    case 'abandoned':
      return {
        label: 'ABANDONED',
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        dot: 'bg-orange-400'
      };
    case 'exhausted':
      return {
        label: 'EXHAUSTED',
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
        dot: 'bg-slate-400'
      };
    case 'blocked':
    case 'stopped':
      return {
        label: 'BLOCKED',
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/20',
        dot: 'bg-rose-400'
      };
    case 'allowed':
    case 'allow':
      return {
        label: 'ALLOWED',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400'
      };
    case 'wait':
      return {
        label: 'WAIT',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400'
      };
    default:
      return {
        label: (status || 'UNKNOWN').toUpperCase(),
        bg: 'bg-slate-500/10',
        text: 'text-slate-300',
        border: 'border-slate-500/20',
        dot: 'bg-slate-400'
      };
  }
}
