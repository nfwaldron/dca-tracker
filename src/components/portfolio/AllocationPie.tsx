import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
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

function PieLegend({ data }: { data: PieSlice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '0.35rem 0.75rem',
        padding: '0.75rem 0.25rem 0',
      }}
    >
      {data.map(d => {
        const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0';
        return (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
            <div style={{ width: 11, height: 11, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>
              {d.name}{' '}
              <span style={{ color: '#64748b' }}>{pct}%</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AllocationPie({ data, compact }: { data: PieSlice[]; compact?: boolean }) {
  const pieChart = (
    <ResponsiveContainer width="100%" height={compact ? 220 : 280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={compact ? 60 : 75}
          outerRadius={compact ? 95 : 120}
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
      </PieChart>
    </ResponsiveContainer>
  );

  if (compact) return <>{pieChart}<PieLegend data={data} /></>;
  return (
    <ChartSection>
      <SectionTitle>Allocation</SectionTitle>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 280px', height: 280 }}>
          {pieChart}
        </div>
        <div style={{ flex: '0 1 320px', minWidth: 180 }}>
          <PieLegend data={data} />
        </div>
      </div>
    </ChartSection>
  );
}
