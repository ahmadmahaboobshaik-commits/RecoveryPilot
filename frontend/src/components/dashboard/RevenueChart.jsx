import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { formatRupeesShort } from '../../lib/formatters';

export function RevenueChart({ metrics }) {
  const atRisk = (metrics?.total_at_risk || 0) / 100.0;
  const recovered = (metrics?.total_recovered || 0) / 100.0;

  const data = [
    { name: 'Total At Risk', amount: atRisk, fill: '#6366F1' },
    { name: 'Recovered', amount: recovered, fill: '#22C55E' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-aurora-surface border border-white/10 p-3 rounded-xl shadow-xl font-mono text-xs">
          <div className="text-slate-400 font-semibold mb-1">{item.payload.name}</div>
          <div className="text-white font-bold text-sm">
            {formatRupeesShort(item.value * 100)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Revenue Overview</h3>
          <p className="text-xs text-slate-400">At-Risk vs Verified Recovered Revenue</p>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
          SQLite Live Data
        </span>
      </div>

      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              stroke="#64748B" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748B" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={48}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
