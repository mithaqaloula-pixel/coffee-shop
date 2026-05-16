import { prisma } from '@/lib/prisma';
import { formatOMR, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  pending: { label: 'معلق', class: 'bg-amber-100 text-amber-700' },
  preparing: { label: 'قيد التحضير', class: 'bg-blue-100 text-blue-700' },
  completed: { label: 'مكتمل', class: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'ملغي', class: 'bg-red-100 text-red-700' },
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'نقداً',
  thawani: 'ثواني',
  tap: 'تاب',
};

export default async function OrderHistoryPage({
  searchParams,
}: {
  searchParams: { status?: string; dateFrom?: string; dateTo?: string };
}) {
  const { status, dateFrom, dateTo } = searchParams;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo + 'T23:59:59') } : {}),
            },
          }
        : {}),
    },
    include: {
      customer: { select: { name: true, phone: true } },
      items: { select: { quantity: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="p-6 bg-surface-50 min-h-full" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-700">سجل الطلبات</h1>
        <p className="text-sm text-gray-500 mt-1">
          {orders.length} طلب • إجمالي المكتملة: {formatOMR(totalRevenue)}
        </p>
      </div>

      {/* Filters */}
      <form className="bg-white rounded-xl border border-surface-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">الحالة</label>
            <select
              name="status"
              defaultValue={status ?? ''}
              className="h-9 rounded-lg border border-input px-3 text-sm bg-background"
            >
              <option value="">الكل</option>
              <option value="pending">معلق</option>
              <option value="preparing">قيد التحضير</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">من تاريخ</label>
            <input
              type="date"
              name="dateFrom"
              defaultValue={dateFrom ?? ''}
              className="h-9 rounded-lg border border-input px-3 text-sm bg-background"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">إلى تاريخ</label>
            <input
              type="date"
              name="dateTo"
              defaultValue={dateTo ?? ''}
              className="h-9 rounded-lg border border-input px-3 text-sm bg-background"
            />
          </div>
          <button
            type="submit"
            className="h-9 px-4 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-600"
          >
            بحث
          </button>
          <a
            href="/orders/history"
            className="h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-sm flex items-center hover:bg-surface-50"
          >
            إعادة تعيين
          </a>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">رقم الطلب</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">العميل</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الأصناف</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الإجمالي</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الدفع</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {orders.map((order) => {
                const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, class: 'bg-gray-100 text-gray-600' };
                const itemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
                return (
                  <tr key={order.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {order.customer ? (
                        <div>
                          <div className="font-medium">{order.customer.name}</div>
                          <div className="text-xs text-gray-400">{order.customer.phone}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">زائر</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{itemsCount} صنف</td>
                    <td className="px-4 py-3 font-mono font-bold text-brand-700">
                      {formatOMR(order.total)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {PAYMENT_LABELS[order.paymentMethod ?? ''] ?? order.paymentMethod ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-16 text-gray-400">لا توجد طلبات بهذه المعايير</div>
          )}
        </div>
      </div>
    </div>
  );
}
