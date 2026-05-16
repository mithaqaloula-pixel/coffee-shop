'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatOMR, formatDate } from '@/lib/utils';

type Category = { id: string; name: string; icon: string; color: string };
type Expense = {
  id: string;
  amount: number;
  expenseDate: string;
  description: string;
  paymentMethod: string;
  category: Category;
};

type Props = {
  expenses: Expense[];
  categories: Category[];
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'نقداً',
  bank: 'تحويل',
  card: 'بطاقة',
  cheque: 'شيك',
};

type FormData = {
  categoryId: string;
  amount: string;
  expenseDate: string;
  description: string;
  paymentMethod: string;
  notes: string;
};

export function ExpensesClient({ expenses: initial, categories }: Props) {
  const [expenses, setExpenses] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormData>({
    categoryId: categories[0]?.id ?? '',
    amount: '',
    expenseDate: new Date().toISOString().slice(0, 10),
    description: '',
    paymentMethod: 'cash',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Category totals
  const catTotals: Record<string, number> = {};
  for (const e of expenses) {
    catTotals[e.category.id] = (catTotals[e.category.id] ?? 0) + e.amount;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/accounting/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: form.categoryId,
          amount: parseFloat(form.amount),
          expenseDate: new Date(form.expenseDate).toISOString(),
          description: form.description,
          paymentMethod: form.paymentMethod,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setExpenses([created, ...expenses]);
      setShowModal(false);
    } catch {
      setError('فشل إضافة المصروف');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">المصروفات</h1>
          <p className="text-sm text-gray-500 mt-1">
            الإجمالي: {formatOMR(expenses.reduce((s, e) => s + e.amount, 0))}
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-brand-700 hover:bg-brand-600 text-white"
        >
          + إضافة مصروف
        </Button>
      </div>

      {/* Category summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {categories
          .filter((c) => catTotals[c.id])
          .map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-surface-200 shadow-sm p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{cat.icon}</span>
                <span className="text-xs text-gray-500 truncate">{cat.name}</span>
              </div>
              <p className="font-bold text-gray-900 font-mono text-sm">
                {formatOMR(catTotals[cat.id] ?? 0)}
              </p>
            </div>
          ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">التاريخ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الفئة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الوصف</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">المبلغ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">طريقة الدفع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(expense.expenseDate)}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span>{expense.category.icon}</span>
                      <span className="text-gray-700">{expense.category.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{expense.description}</td>
                  <td className="px-4 py-3 font-mono font-bold text-red-700">
                    {formatOMR(expense.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {PAYMENT_LABELS[expense.paymentMethod] ?? expense.paymentMethod}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    لا توجد مصروفات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-brand-700 mb-4">إضافة مصروف جديد</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="catId">الفئة</Label>
                <select
                  id="catId"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-input px-3 text-sm bg-background"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="amount">المبلغ (ر.ع)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="any"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expDate">التاريخ</Label>
                  <Input
                    id="expDate"
                    type="date"
                    value={form.expenseDate}
                    onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="desc">الوصف</Label>
                <Input
                  id="desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pm">طريقة الدفع</Label>
                <select
                  id="pm"
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="w-full h-10 rounded-lg border border-input px-3 text-sm bg-background"
                >
                  <option value="cash">نقداً</option>
                  <option value="bank">تحويل بنكي</option>
                  <option value="card">بطاقة</option>
                  <option value="cheque">شيك</option>
                </select>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-700 hover:bg-brand-600 text-white"
                >
                  {loading ? 'جاري الحفظ...' : 'إضافة'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
