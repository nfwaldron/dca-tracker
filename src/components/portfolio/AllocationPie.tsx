import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDollars } from '../../utils/format';
import { ChartSection, SectionTitle } from '../ui/Layout';

export const PIE_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#10b981', '#ec4899', '#6366f1',
  '#84cc16', '#14b8a6', '#a78bfa', '#fb923c',
];

export interface PieSlice {
  name: string;
  value: number;
  color: string;
}

export function AllocationPie({ data, compact }: { data: PieSlice[]; compact?: boolean }) {
  const chart = (
    <ResponsiveContainer width="100%" height={compact ? 260 : 340}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={compact ? 65 : 80}
          outerRadius={compact ? 100 : 130}
dataKey="value"
        >
          {data.map(entry => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(val, name) => {
            const total = data.reduce((s, d) => s + d.value, 0);
            const pct = total > 0 ? ((val as number) / total * 100).toFixed(1) : '0';
            return [`${formatDollars(val as number)} (${pct}%)`, name];
          }}
          contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
          labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
          itemStyle={{ color: '#94a3b8' }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '0.75rem' }}
          formatter={(value, entry) => {
            const total = data.reduce((s, d) => s + d.value, 0);
            const pct = total > 0 ? ((entry.payload as PieSlice).value / total * 100).toFixed(1) : '0';
            return (
              <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                {value} <span style={{ color: '#64748b' }}>{pct}%</span>
              </span>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  if (compact) return chart;
  return (
    <ChartSection>
      <SectionTitle>Allocation</SectionTitle>
      {chart}
    </ChartSection>
  );
}
