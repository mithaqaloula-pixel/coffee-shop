'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatOMR } from '@/lib/utils';

type Supplier = { id: string; name: string };

type InventoryItem = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unitCost: number;
  reorderThreshold: number;
  supplierId: string | null;
  supplier: Supplier | null;
};

type Props = {
  items: InventoryItem[];
  suppliers: Supplier[];
};

type FormData = {
  name: string;
  unit: string;
  quantity: string;
  unitCost: string;
  reorderThreshold: string;
  supplierId: string;
};

type RestockData = {
  quantity: string;
  unitCost: string;
};

const emptyForm: FormData = {
  name: '',
  unit: 'g',
  quantity: '0',
  unitCost: '0',
  reorderThreshold: '0',
  supplierId: '',
};

export function InventoryClient({ items: initialItems, suppliers }: Props) {
  const [items, setItems] = useState(initialItems);
  const [showModal, setShowModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [restockForm, setRestockForm] = useState<RestockData>({ quantity: '', unitCost: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function openAdd() {
    setEditItem(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  }

  function openEdit(item: InventoryItem) {
    setEditItem(item);
    setForm({
      name: item.name,
      unit: item.unit,
      quantity: String(item.quantity),
      unitCost: String(item.unitCost),
      reorderThreshold: String(item.reorderThreshold),
      supplierId: item.supplierId ?? '',
    });
    setError('');
    setShowModal(true);
  }

  function openRestock(item: InventoryItem) {
    setRestockItem(item);
    setRestockForm({ quantity: '', unitCost: String(item.unitCost) });
    setError('');
    setShowRestockModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name: form.name,
      unit: form.unit,
      quantity: parseFloat(form.quantity) || 0,
      unitCost: parseFloat(form.unitCost) || 0,
      reorderThreshold: parseFloat(form.reorderThreshold) || 0,
      supplierId: form.supplierId || null,
    };

    try {
      if (editItem) {
        const res = await fetch(`/api/inventory/${editItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('فشل التحديث');
        const updated = await res.json();
        setItems(items.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const res = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('فشل الإضافة');
        const created = await res.json();
        setItems([...items, created].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setShowModal(false);
    } catch {
      setError('حدث خطأ، يرجى المحاولة مجدداً');
    } finally {
      setLoading(false);
    }
  }

  async function handleRestock(e: React.FormEvent) {
    e.preventDefault();
    if (!restockItem) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/inventory/${restockItem.id}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: parseFloat(restockForm.quantity),
          unitCost: parseFloat(restockForm.unitCost),
        }),
      });
      if (!res.ok) throw new Error('فشل التخزين');
      const updated = await res.json();
      setItems(items.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)));
      setShowRestockModal(false);
    } catch {
      setError('حدث خطأ، يرجى المحاولة مجدداً');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل تريد حذف هذا الصنف؟')) return;
    try {
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      setItems(items.filter((i) => i.id !== id));
    } catch {
      alert('فشل الحذف');
    }
  }

  const lowStockCount = items.filter((i) => i.quantity <= i.reorderThreshold).length;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">إدارة المخزون</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} صنف •{' '}
            {lowStockCount > 0 && (
              <span className="text-red-600 font-medium">{lowStockCount} أصناف منخفضة</span>
            )}
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-brand-700 hover:bg-brand-600 text-white"
        >
          + إضافة صنف جديد
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الصنف</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الكمية</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الوحدة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">تكلفة الوحدة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">حد إعادة الطلب</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">المورد</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {items.map((item) => {
                const isLow = item.quantity <= item.reorderThreshold;
                return (
                  <tr
                    key={item.id}
                    className={cn('hover:bg-surface-50 transition-colors', isLow && 'bg-red-50')}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-gray-700 font-mono">{item.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                    <td className="px-4 py-3 text-gray-700 font-mono">{formatOMR(item.unitCost)}</td>
                    <td className="px-4 py-3 text-gray-500">{item.reorderThreshold.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{item.supplier?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      {isLow ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          منخفض
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          مناسب
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openRestock(item)}
                          className="text-xs px-2 py-1 rounded bg-brand-100 text-brand-700 hover:bg-brand-200 transition-colors font-medium"
                        >
                          إعادة تخزين
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-brand-700 mb-4">
              {editItem ? 'تعديل الصنف' : 'إضافة صنف جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">اسم الصنف</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: حبوب قهوة عربية"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="unit">الوحدة</Label>
                  <select
                    id="unit"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input px-3 text-sm bg-background"
                  >
                    <option value="g">جرام (g)</option>
                    <option value="ml">مليلتر (ml)</option>
                    <option value="piece">قطعة</option>
                    <option value="kg">كيلوجرام</option>
                    <option value="l">لتر</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="quantity">الكمية الحالية</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="any"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="unitCost">تكلفة الوحدة (ر.ع)</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    min="0"
                    step="any"
                    value={form.unitCost}
                    onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="reorderThreshold">حد إعادة الطلب</Label>
                  <Input
                    id="reorderThreshold"
                    type="number"
                    min="0"
                    step="any"
                    value={form.reorderThreshold}
                    onChange={(e) => setForm({ ...form, reorderThreshold: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="supplier">المورد (اختياري)</Label>
                <select
                  id="supplier"
                  value={form.supplierId}
                  onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-input px-3 text-sm bg-background"
                >
                  <option value="">— بدون مورد —</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-700 hover:bg-brand-600 text-white"
                >
                  {loading ? 'جاري الحفظ...' : editItem ? 'حفظ التغييرات' : 'إضافة'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-bold text-brand-700 mb-1">إعادة تخزين</h2>
            <p className="text-sm text-gray-500 mb-4">{restockItem.name} — الرصيد الحالي: {restockItem.quantity} {restockItem.unit}</p>
            <form onSubmit={handleRestock} className="space-y-4">
              <div>
                <Label htmlFor="rqty">الكمية المضافة ({restockItem.unit})</Label>
                <Input
                  id="rqty"
                  type="number"
                  min="0.001"
                  step="any"
                  value={restockForm.quantity}
                  onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="rcost">تكلفة الوحدة الجديدة (ر.ع)</Label>
                <Input
                  id="rcost"
                  type="number"
                  min="0"
                  step="any"
                  value={restockForm.unitCost}
                  onChange={(e) => setRestockForm({ ...restockForm, unitCost: e.target.value })}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRestockModal(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-700 hover:bg-brand-600 text-white"
                >
                  {loading ? 'جاري...' : 'إعادة تخزين'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
