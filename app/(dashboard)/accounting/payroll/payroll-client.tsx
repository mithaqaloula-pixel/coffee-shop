'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatOMR } from '@/lib/utils';

type PayrollEntry = {
  id: string;
  month: number;
  year: number;
  baseSalary: number;
  bonus: number;
  deductions: number;
  overtime: number;
  netPay: number;
  status: string;
  paidDate: string | null;
  employee: {
    id: string;
    name: string;
    role: string;
    phone: string | null;
  };
};

type Props = { entries: PayrollEntry[]; currentMonth: number; currentYear: number };

const ROLE_LABELS: Record<string, string> = {
  barista: 'باريستا',
  cashier: 'كاشير',
  manager: 'مدير',
};

export function PayrollClient({ entries: initial, currentMonth, currentYear }: Props) {
  const [entries, setEntries] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

  const totalPending = entries.filter((e) => e.status === 'pending').reduce((s, e) => s + e.netPay, 0);
  const totalPaid = entries.filter((e) => e.status === 'paid').reduce((s, e) => s + e.netPay, 0);

  async function markPaid(entryId: string) {
    setLoading(entryId);
    try {
      const res = await fetch('/api/accounting/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markPaid', entryId }),
      });
      if (!res.ok) throw new Error();
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? { ...e, status: 'paid', paidDate: new Date().toISOString() }
            : e
        )
      );
    } catch {
      alert('فشل تسجيل الدفع');
    } finally {
      setLoading(null);
    }
  }

  async function approveAll() {
    if (!confirm('هل تريد اعتماد جميع الرواتب المعلقة؟')) return;
    const pending = entries.filter((e) => e.status === 'pending');
    for (const entry of pending) {
      await markPaid(entry.id);
    }
  }

  const MONTH_NAMES = [
    'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">الرواتب</h1>
          <p className="text-sm text-gray-500 mt-1">
            {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </p>
        </div>
        <Button
          onClick={approveAll}
          className="bg-brand-700 hover:bg-brand-600 text-white"
        >
          اعتماد جميع الرواتب
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">إجمالي الرواتب</p>
          <p className="text-xl font-bold text-gray-900 font-mono">{formatOMR(totalPending + totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">معلق الدفع</p>
          <p className="text-xl font-bold text-amber-600 font-mono">{formatOMR(totalPending)}</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">تم الدفع</p>
          <p className="text-xl font-bold text-emerald-600 font-mono">{formatOMR(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">عدد الموظفين</p>
          <p className="text-xl font-bold text-gray-900">{entries.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الموظف</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الدور</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الراتب الأساسي</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">المكافآت</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الخصومات</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الصافي</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{entry.employee.name}</div>
                    {entry.employee.phone && (
                      <div className="text-xs text-gray-400" dir="ltr">{entry.employee.phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ROLE_LABELS[entry.employee.role] ?? entry.employee.role}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-700">{formatOMR(entry.baseSalary)}</td>
                  <td className="px-4 py-3 font-mono text-emerald-600">
                    {entry.bonus > 0 ? `+${formatOMR(entry.bonus)}` : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-red-600">
                    {entry.deductions > 0 ? `-${formatOMR(entry.deductions)}` : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-brand-700">{formatOMR(entry.netPay)}</td>
                  <td className="px-4 py-3">
                    {entry.status === 'paid' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        مدفوع ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        معلق
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {entry.status === 'pending' ? (
                      <button
                        onClick={() => markPaid(entry.id)}
                        disabled={loading === entry.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-brand-700 text-white hover:bg-brand-600 transition-colors font-medium disabled:opacity-60"
                      >
                        {loading === entry.id ? '...' : 'تسجيل الدفع'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {entry.paidDate ? new Date(entry.paidDate).toLocaleDateString('ar-OM') : ''}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
