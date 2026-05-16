import { prisma } from '@/lib/prisma';
import { formatOMR } from '@/lib/utils';
import { RevenueLineChart, TopProductsBarChart } from './charts';

export const dynamic = 'force-dynamic';

type Period = 'today' | 'week' | 'month';

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'نقداً',
  thawani: 'ثواني',
  tap: 'تاب',
};

function getDateRange(period: Period): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  if (period === 'today') {
    from.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    from.setDate(from.getDate() - 7);
    from.setHours(0, 0, 0, 0);
  } else {
    from.setDate(from.getDate() - 30);
    from.setHours(0, 0, 0, 0);
  }
  return { from, to };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const period = (searchParams.period as Period) ?? 'week';
  const { from, to } = getDateRange(period);

  const orders = await prisma.order.findMany({
    where: {
      status: 'completed',
      createdAt: { gte: from, lte: to },
    },
    include: {
      items: { include: { product: { select: { nameAr: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue by day
  const revenueByDay: Record<string, number> = {};
  for (const order of orders) {
    const day = order.createdAt.toISOString().slice(0, 10);
    revenueByDay[day] = (revenueByDay[day] ?? 0) + order.total;
  }
  const revenueChartData = Object.entries(revenueByDay).map(([date, revenue]) => ({
    date: date.slice(5),
    revenue: +revenue.toFixed(3),
  }));

  // Top products
  const productQty: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const order of orders) {
    for (const item of order.items) {
      const key = item.productId;
      if (!productQty[key]) {
        productQty[key] = { name: item.product.nameAr, quantity: 0, revenue: 0 };
      }
      productQty[key].quantity += item.quantity;
      productQty[key].revenue += item.lineTotal;
    }
  }
  const topProducts = Object.values(productQty)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const topProduct = topProducts[0]?.name ?? '—';

  // By payment method
  const byPayment: Record<string, { count: number; total: number }> = {};
  for (const order of orders) {
    const pm = order.paymentMethod ?? 'cash';
    if (!byPayment[pm]) byPayment[pm] = { count: 0, total: 0 };
    byPayment[pm].count += 1;
    byPayment[pm].total += order.total;
  }

  return (
    <div className="p-6 bg-surface-50 min-h-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">تقارير المبيعات</h1>
          <p className="text-sm text-gray-500 mt-1">البيانات المكتملة فقط</p>
        </div>
        {/* Period selector */}
        <div className="flex gap-1 bg-white border border-surface-200 rounded-xl p-1">
          {(['today', 'week', 'month'] as Period[]).map((p) => (
            <a
              key={p}
              href={`?period=${p}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-brand-700 text-white'
                  : 'text-gray-600 hover:bg-surface-50'
              }`}
            >
              {p === 'today' ? 'اليوم' : p === 'week' ? 'الأسبوع' : 'الشهر'}
            </a>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">إجمالي الإيراد</p>
          <p className="text-2xl font-bold text-brand-700 font-mono">{formatOMR(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">عدد الطلبات</p>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">متوسط قيمة الطلب</p>
          <p className="text-2xl font-bold text-gray-900 font-mono">{formatOMR(avgOrderValue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">الأكثر مبيعاً</p>
          <p className="text-lg font-bold text-gray-900 truncate">{topProduct}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">الإيراد اليومي</h2>
          {revenueChartData.length > 0 ? (
            <RevenueLineChart data={revenueChartData} />
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
              لا بيانات للفترة المحددة
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">أكثر المنتجات مبيعاً</h2>
          {topProducts.length > 0 ? (
            <TopProductsBarChart data={topProducts} />
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
              لا بيانات للفترة المحددة
            </div>
          )}
        </div>
      </div>

      {/* Payment method breakdown */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-200">
          <h2 className="font-bold text-gray-900">توزيع طرق الدفع</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50">
              <tr>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">طريقة الدفع</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">عدد الطلبات</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الإجمالي</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">النسبة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {Object.entries(byPayment).map(([method, data]) => (
                <tr key={method} className="hover:bg-surface-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {PAYMENT_LABELS[method] ?? method}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{data.count}</td>
                  <td className="px-4 py-3 font-mono text-brand-700">{formatOMR(data.total)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {totalOrders > 0 ? ((data.count / totalOrders) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
              {Object.keys(byPayment).length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">لا بيانات</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
