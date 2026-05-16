'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type RevenueDay = { date: string; revenue: number };
type TopProduct = { name: string; quantity: number; revenue: number };

export function RevenueLineChart({ data }: { data: RevenueDay[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v.toFixed(0)}`} />
        <Tooltip formatter={(v: number) => [`${v.toFixed(3)} ر.ع`, 'الإيراد']} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#1B5E3A"
          strokeWidth={2}
          dot={{ fill: '#1B5E3A', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TopProductsBarChart({ data }: { data: TopProduct[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => [v, 'الكمية المباعة']} />
        <Bar dataKey="quantity" fill="#1B5E3A" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
