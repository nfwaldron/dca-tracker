import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fmt$ } from '../../selectors';
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
    <ResponsiveContainer width="100%" height={compact ? 280 : 380}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={compact ? 70 : 90}
          outerRadius={compact ? 110 : 150}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(1)}%`}
          labelLine={false}
        >
          {data.map(entry => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={val => [fmt$(val as number), 'Market Value']}
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '1rem' }}
          formatter={value => (
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{value}</span>
          )}
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
