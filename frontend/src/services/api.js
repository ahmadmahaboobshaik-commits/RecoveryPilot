const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.detail || payload?.message || `Request failed (${response.status})`);
  return payload;
}

export const api = {
  getHealth: () => request('/health'),
  getMetrics: () => request('/api/metrics'),
  getActivity: (limit = 50) => request(`/api/recovery/activity?limit=${limit}`),
  getPayments: (params = {}) => {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null));
    return request(`/api/payments${query.size ? `?${query}` : ''}`);
  },
  getPaymentDetails: (id) => request(`/api/payments/${encodeURIComponent(id)}`),
  diagnosePayment: (id) => request(`/api/diagnose/${encodeURIComponent(id)}`, { method: 'POST' }),
  evaluatePayment: (id) => request(`/api/evaluate/${encodeURIComponent(id)}`, { method: 'POST' }),
  executePayment: (id) => request(`/api/execute/${encodeURIComponent(id)}`, { method: 'POST' }),
  simulateWebhook: (id) => request(`/api/webhooks/simulate/${encodeURIComponent(id)}`, { method: 'POST' }),
  resetDemo: () => request('/api/demo/reset', { method: 'POST' }),
  runBatch: (mode = 'dry_run') => request(`/api/recovery/run-batch?mode=${mode}`, { method: 'POST' }),
  getBatches: (limit = 20) => request(`/api/recovery/batches?limit=${limit}`),
};

export { BASE_URL };
