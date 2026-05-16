'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatOMR } from '@/lib/utils';

type Supplier = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  contactPerson: string | null;
  paymentTerms: string;
  invoiceCount: number;
  outstandingBalance: number;
};

type Props = { suppliers: Supplier[] };

type FormData = {
  name: string;
  phone: string;
  email: string;
  contactPerson: string;
  paymentTerms: string;
  address: string;
  notes: string;
};

const PAYMENT_TERMS_LABELS: Record<string, string> = {
  cash: 'نقداً',
  net_30: 'صافي 30 يوم',
  net_60: 'صافي 60 يوم',
};

export function SuppliersClient({ suppliers: initial }: Props) {
  const [suppliers, setSuppliers] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    contactPerson: '',
    paymentTerms: 'cash',
    address: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/accounting/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || null,
          email: form.email || null,
          contactPerson: form.contactPerson || null,
          paymentTerms: form.paymentTerms,
          address: form.address || null,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setSuppliers([...suppliers, { ...created, invoiceCount: 0, outstandingBalance: 0 }]);
      setShowModal(false);
    } catch {
      setError('فشل إضافة المورد');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">الموردون</h1>
          <p className="text-sm text-gray-500 mt-1">{suppliers.length} مورد</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-brand-700 hover:bg-brand-600 text-white"
        >
          + إضافة مورد
        </Button>
      </div>

      {/* Supplier cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-white rounded-xl border border-surface-200 shadow-sm p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{supplier.name}</h3>
                {supplier.contactPerson && (
                  <p className="text-xs text-gray-500 mt-0.5">{supplier.contactPerson}</p>
                )}
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-brand-50 text-brand-700 font-medium">
                {PAYMENT_TERMS_LABELS[supplier.paymentTerms] ?? supplier.paymentTerms}
              </span>
            </div>

            <div className="space-y-1.5 text-sm mb-4">
              {supplier.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-gray-400">📞</span>
                  <span dir="ltr">{supplier.phone}</span>
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-gray-400">✉️</span>
                  <span>{supplier.email}</span>
                </div>
              )}
            </div>

            <div className="border-t border-surface-100 pt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">الفواتير</p>
                <p className="font-bold text-gray-900">{supplier.invoiceCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">الرصيد المستحق</p>
                <p className={`font-bold ${supplier.outstandingBalance > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatOMR(supplier.outstandingBalance)}
                </p>
              </div>
            </div>
          </div>
        ))}
        {suppliers.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">لا يوجد موردون</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-brand-700 mb-4">إضافة مورد جديد</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="sname">اسم المورد</Label>
                <Input
                  id="sname"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="sphone">الجوال</Label>
                  <Input
                    id="sphone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="semail">البريد الإلكتروني</Label>
                  <Input
                    id="semail"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="scontact">مسؤول التواصل</Label>
                  <Input
                    id="scontact"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="sterms">شروط الدفع</Label>
                  <select
                    id="sterms"
                    value={form.paymentTerms}
                    onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input px-3 text-sm bg-background"
                  >
                    <option value="cash">نقداً</option>
                    <option value="net_30">صافي 30 يوم</option>
                    <option value="net_60">صافي 60 يوم</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="saddress">العنوان</Label>
                <Input
                  id="saddress"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
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
