import { prisma } from '@/lib/prisma';
import { formatOMR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Period = 'this_month' | 'last_month' | 'this_year';

function getDateRange(period: Period): { from: Date; to: Date } {
  const now = new Date();
  if (period === 'this_month') {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
    };
  } else if (period === 'last_month') {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
    };
  } else {
    return {
      from: new Date(now.getFullYear(), 0, 1),
      to: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
    };
  }
}

export default async function AccountingReportsPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const period = (searchParams.period as Period) ?? 'this_month';
  const { from, to } = getDateRange(period);

  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({
      where: { status: 'completed', createdAt: { gte: from, lte: to } },
      include: {
        items: {
          include: {
            product: {
              include: {
                recipe: {
                  include: { items: { include: { inventoryItem: true } } },
                },
              },
            },
          },
        },
      },
    }),
    prisma.expense.findMany({
      where: { expenseDate: { gte: from, lte: to } },
      include: { category: true },
    }),
  ]);

  // Revenue
  const revenue = orders.reduce((s, o) => s + o.total, 0);

  // COGS: sum of recipe costs for all order items
  let cogs = 0;
  for (const order of orders) {
    for (const item of order.items) {
      const recipe = item.product.recipe;
      if (!recipe) continue;
      const itemCost = recipe.items.reduce(
        (s, ri) => s + ri.quantity * (ri.inventoryItem?.unitCost ?? 0),
        0
      );
      cogs += itemCost * item.quantity;
    }
  }

  const grossProfit = revenue - cogs;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  // Operating expenses
  const opExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = grossProfit - opExpenses;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  // Expenses by category
  const expenseByCategory: Record<string, { name: string; icon: string; total: number }> = {};
  for (const e of expenses) {
    const key = e.categoryId;
    if (!expenseByCategory[key]) {
      expenseByCategory[key] = { name: e.category.name, icon: e.category.icon, total: 0 };
    }
    expenseByCategory[key].total += e.amount;
  }

  const PERIOD_LABELS: Record<Period, string> = {
    this_month: 'هذا الشهر',
    last_month: 'الشهر الماضي',
    this_year: 'هذه السنة',
  };

  function FinancialRow({
    label,
    amount,
    isTotal = false,
    isNegative = false,
    indent = false,
    highlight = false,
  }: {
    label: string;
    amount: number;
    isTotal?: boolean;
    isNegative?: boolean;
    indent?: boolean;
    highlight?: boolean;
  }) {
    return (
      <div
        className={`flex items-center justify-between py-2.5 px-4 rounded-lg ${
          highlight ? 'bg-brand-50 border border-brand-200' : ''
        } ${isTotal ? 'font-bold' : ''}`}
      >
        <span className={`text-gray-${indent ? '600 text-sm' : '800'} ${indent ? 'mr-4' : ''}`}>
          {label}
        </span>
        <span
          className={`font-mono ${
            isTotal && amount < 0
              ? 'text-red-600 font-bold'
              : isTotal && highlight
              ? 'text-brand-700 font-bold'
              : isNegative || amount < 0
              ? 'text-red-600'
              : amount > 0 && isTotal
              ? 'text-emerald-600'
              : 'text-gray-900'
          }`}
        >
          {isNegative ? `(${formatOMR(Math.abs(amount))})` : formatOMR(amount)}
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-surface-50 min-h-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">قائمة الأرباح والخسائر</h1>
          <p className="text-sm text-gray-500 mt-1">{PERIOD_LABELS[period]}</p>
        </div>
        {/* Period selector */}
        <div className="flex gap-1 bg-white border border-surface-200 rounded-xl p-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <a
              key={p}
              href={`?period=${p}`}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-brand-700 text-white'
                  : 'text-gray-600 hover:bg-surface-50'
              }`}
            >
              {PERIOD_LABELS[p]}
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P&L Statement */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
          <div className="bg-brand-700 text-white px-5 py-4">
            <h2 className="font-bold text-lg">قائمة الدخل</h2>
            <p className="text-brand-200 text-sm mt-0.5">
              {from.toLocaleDateString('ar-OM')} — {to.toLocaleDateString('ar-OM')}
            </p>
          </div>
          <div className="p-4 space-y-1">
            {/* Revenue */}
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 pt-2 pb-1">
              الإيرادات
            </p>
            <FinancialRow label="إيرادات المبيعات" amount={revenue} />
            <FinancialRow label="إجمالي الإيرادات" amount={revenue} isTotal />

            {/* COGS */}
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 pt-4 pb-1">
              تكلفة البضاعة المباعة
            </p>
            <FinancialRow label="تكلفة المواد الخام" amount={cogs} isNegative indent />
            <FinancialRow label="إجمالي التكلفة" amount={-cogs} isTotal />

            {/* Gross profit */}
            <div className="my-2 border-t border-surface-200" />
            <FinancialRow
              label={`مجمل الربح (${grossMargin.toFixed(1)}%)`}
              amount={grossProfit}
              isTotal
              highlight
            />

            {/* Operating expenses */}
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 pt-4 pb-1">
              المصروفات التشغيلية
            </p>
            {Object.values(expenseByCategory).map((cat) => (
              <FinancialRow
                key={cat.name}
                label={`${cat.icon} ${cat.name}`}
                amount={cat.total}
                isNegative
                indent
              />
            ))}
            <FinancialRow label="إجمالي المصروفات" amount={-opExpenses} isTotal />

            {/* Net profit */}
            <div className="my-2 border-t-2 border-brand-700" />
            <FinancialRow
              label={`صافي الربح (${netMargin.toFixed(1)}%)`}
              amount={netProfit}
              isTotal
              highlight
            />
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">ملخص مالي</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">الإيرادات</span>
                <span className="font-mono font-bold text-gray-900">{formatOMR(revenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">تكلفة البضاعة</span>
                <span className="font-mono text-red-600">({formatOMR(cogs)})</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-medium text-gray-700">مجمل الربح</span>
                <span className="font-mono font-bold text-emerald-600">{formatOMR(grossProfit)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">المصروفات</span>
                <span className="font-mono text-red-600">({formatOMR(opExpenses)})</span>
              </div>
              <div className="flex justify-between items-center border-t-2 border-brand-700 pt-2">
                <span className="text-base font-bold text-gray-900">صافي الربح</span>
                <span className={`font-mono font-bold text-xl ${netProfit >= 0 ? 'text-brand-700' : 'text-red-600'}`}>
                  {formatOMR(netProfit)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">مؤشرات الأداء</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">هامش مجمل الربح</p>
                <p className={`text-xl font-bold ${grossMargin >= 60 ? 'text-emerald-600' : grossMargin >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                  {grossMargin.toFixed(1)}%
                </p>
              </div>
              <div className="bg-surface-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">هامش صافي الربح</p>
                <p className={`text-xl font-bold ${netMargin >= 20 ? 'text-emerald-600' : netMargin >= 10 ? 'text-amber-600' : 'text-red-600'}`}>
                  {netMargin.toFixed(1)}%
                </p>
              </div>
              <div className="bg-surface-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">عدد الطلبات</p>
                <p className="text-xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="bg-surface-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">متوسط الطلب</p>
                <p className="text-xl font-bold text-gray-900 font-mono text-base">
                  {formatOMR(orders.length > 0 ? revenue / orders.length : 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Expense breakdown */}
          <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">تفصيل المصروفات</h2>
            <div className="space-y-2">
              {Object.values(expenseByCategory)
                .sort((a, b) => b.total - a.total)
                .map((cat) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="text-lg w-6 text-center">{cat.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{cat.name}</span>
                        <span className="font-mono text-red-600">{formatOMR(cat.total)}</span>
                      </div>
                      <div className="h-1.5 bg-surface-100 rounded-full">
                        <div
                          className="h-full bg-brand-400 rounded-full"
                          style={{
                            width: opExpenses > 0 ? `${(cat.total / opExpenses) * 100}%` : '0%',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              {Object.keys(expenseByCategory).length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">لا توجد مصروفات</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
