'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatOMR, formatDate } from '@/lib/utils';

type LoyaltyConfig = {
  pointsPerUnit: number;
  redemptionThreshold: number;
  freeDrinkValue: number;
  active: boolean;
  buyXGetYEnabled: boolean;
  buyX: number;
  getY: number;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  points: number;
  totalSpent: number;
  visits: number;
  lastVisitAt: string | null;
};

type Props = {
  config: LoyaltyConfig;
  customers: Customer[];
};

export function LoyaltyClient({ config: initialConfig, customers }: Props) {
  const [config, setConfig] = useState(initialConfig);
  const [configForm, setConfigForm] = useState(initialConfig);
  const [editConfig, setEditConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch('/api/loyalty/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configForm),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setConfig(updated);
      setEditConfig(false);
    } catch {
      alert('فشل حفظ الإعدادات');
    } finally {
      setSavingConfig(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-700">برنامج الولاء</h1>
        <p className="text-sm text-gray-500 mt-1">{customers.length} عميل مسجل</p>
      </div>

      {/* Config card */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">إعدادات البرنامج</h2>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                config.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {config.active ? 'نشط' : 'معطل'}
            </span>
            <button
              onClick={() => {
                setConfigForm(config);
                setEditConfig(true);
              }}
              className="text-sm text-brand-700 hover:underline"
            >
              تعديل
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-surface-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs">نقاط لكل ريال</p>
            <p className="text-xl font-bold text-brand-700">{config.pointsPerUnit}</p>
          </div>
          <div className="bg-surface-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs">نقاط الاسترداد</p>
            <p className="text-xl font-bold text-brand-700">{config.redemptionThreshold}</p>
          </div>
          <div className="bg-surface-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs">قيمة المشروب المجاني</p>
            <p className="text-xl font-bold text-brand-700">{formatOMR(config.freeDrinkValue)}</p>
          </div>
          <div className="bg-surface-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs">اشترِ X احصل على Y</p>
            <p className="text-xl font-bold text-brand-700">
              {config.buyXGetYEnabled ? `${config.buyX}/${config.getY}` : 'معطل'}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="بحث بالاسم أو الجوال..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Customers table */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">العميل</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الجوال</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">النقاط</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">الزيارات</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">إجمالي الإنفاق</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">آخر زيارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((c) => {
                const canRedeem = c.points >= config.redemptionThreshold;
                return (
                  <tr key={c.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs" dir="ltr">{c.phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-700">{c.points}</span>
                        {canRedeem && (
                          <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                            قابل للاسترداد
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{c.visits}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{formatOMR(c.totalSpent)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {c.lastVisitAt ? formatDate(c.lastVisitAt) : '—'}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    لا توجد نتائج
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Config modal */}
      {editConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-brand-700 mb-4">تعديل إعدادات الولاء</h2>
            <form onSubmit={saveConfig} className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="loyaltyActive"
                  checked={configForm.active}
                  onChange={(e) => setConfigForm({ ...configForm, active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="loyaltyActive">تفعيل برنامج الولاء</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ppu">نقاط لكل ريال</Label>
                  <Input
                    id="ppu"
                    type="number"
                    min="1"
                    value={configForm.pointsPerUnit}
                    onChange={(e) => setConfigForm({ ...configForm, pointsPerUnit: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="rth">حد الاسترداد (نقاط)</Label>
                  <Input
                    id="rth"
                    type="number"
                    min="1"
                    value={configForm.redemptionThreshold}
                    onChange={(e) => setConfigForm({ ...configForm, redemptionThreshold: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="fdv">قيمة المشروب المجاني (ر.ع)</Label>
                <Input
                  id="fdv"
                  type="number"
                  min="0"
                  step="any"
                  value={configForm.freeDrinkValue}
                  onChange={(e) => setConfigForm({ ...configForm, freeDrinkValue: parseFloat(e.target.value) })}
                />
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="buyXEnabled"
                    checked={configForm.buyXGetYEnabled}
                    onChange={(e) => setConfigForm({ ...configForm, buyXGetYEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="buyXEnabled">تفعيل عرض اشترِ X احصل على Y</Label>
                </div>
                {configForm.buyXGetYEnabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="buyX">اشترِ X كوب</Label>
                      <Input
                        id="buyX"
                        type="number"
                        min="1"
                        value={configForm.buyX}
                        onChange={(e) => setConfigForm({ ...configForm, buyX: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="getY">احصل على Y مجاناً</Label>
                      <Input
                        id="getY"
                        type="number"
                        min="1"
                        value={configForm.getY}
                        onChange={(e) => setConfigForm({ ...configForm, getY: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setEditConfig(false)}>
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={savingConfig}
                  className="bg-brand-700 hover:bg-brand-600 text-white"
                >
                  {savingConfig ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
