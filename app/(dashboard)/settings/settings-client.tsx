'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Settings = {
  shopName: string;
  shopNameEn: string | null;
  address: string | null;
  phone: string | null;
  vatNumber: string | null;
  receiptFooter: string;
  printerType: string;
  printerAddress: string | null;
  kitchenPrinterAddress: string | null;
  autoPrint: boolean;
  printCopies: number;
};

type Props = { settings: Settings };

export function SettingsClient({ settings: initial }: Props) {
  const [form, setForm] = useState({
    shopName: initial.shopName,
    shopNameEn: initial.shopNameEn ?? '',
    address: initial.address ?? '',
    phone: initial.phone ?? '',
    vatNumber: initial.vatNumber ?? '',
    receiptFooter: initial.receiptFooter,
    printerType: initial.printerType,
    printerAddress: initial.printerAddress ?? '',
    kitchenPrinterAddress: initial.kitchenPrinterAddress ?? '',
    autoPrint: initial.autoPrint,
    printCopies: initial.printCopies,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: form.shopName,
          shopNameEn: form.shopNameEn || null,
          address: form.address || null,
          phone: form.phone || null,
          vatNumber: form.vatNumber || null,
          receiptFooter: form.receiptFooter,
          printerType: form.printerType,
          printerAddress: form.printerAddress || null,
          kitchenPrinterAddress: form.kitchenPrinterAddress || null,
          autoPrint: form.autoPrint,
          printCopies: form.printCopies,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-700">الإعدادات</h1>
        <p className="text-sm text-gray-500 mt-1">إعدادات المتجر والطباعة</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shop info */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">معلومات المتجر</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="shopName">اسم المتجر (عربي)</Label>
                <Input
                  id="shopName"
                  value={form.shopName}
                  onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="shopNameEn">اسم المتجر (إنجليزي)</Label>
                <Input
                  id="shopNameEn"
                  value={form.shopNameEn}
                  onChange={(e) => setForm({ ...form, shopNameEn: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="address">العنوان</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="vat">الرقم الضريبي</Label>
              <Input
                id="vat"
                value={form.vatNumber}
                onChange={(e) => setForm({ ...form, vatNumber: e.target.value })}
                dir="ltr"
                placeholder="OM..."
              />
            </div>
            <div>
              <Label htmlFor="footer">نص ذيل الفاتورة</Label>
              <Input
                id="footer"
                value={form.receiptFooter}
                onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Printer settings */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">إعدادات الطباعة</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="printerType">نوع الطابعة</Label>
              <select
                id="printerType"
                value={form.printerType}
                onChange={(e) => setForm({ ...form, printerType: e.target.value })}
                className="w-full h-10 rounded-lg border border-input px-3 text-sm bg-background"
              >
                <option value="browser">متصفح (طباعة عبر المتصفح)</option>
                <option value="network">شبكة (IP/Port)</option>
                <option value="usb">USB</option>
              </select>
            </div>
            {form.printerType === 'network' && (
              <>
                <div>
                  <Label htmlFor="printerAddr">عنوان الطابعة (IP:Port)</Label>
                  <Input
                    id="printerAddr"
                    value={form.printerAddress}
                    onChange={(e) => setForm({ ...form, printerAddress: e.target.value })}
                    dir="ltr"
                    placeholder="192.168.1.100:9100"
                  />
                </div>
                <div>
                  <Label htmlFor="kitchenAddr">طابعة المطبخ (IP:Port)</Label>
                  <Input
                    id="kitchenAddr"
                    value={form.kitchenPrinterAddress}
                    onChange={(e) => setForm({ ...form, kitchenPrinterAddress: e.target.value })}
                    dir="ltr"
                    placeholder="192.168.1.101:9100"
                  />
                </div>
              </>
            )}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoPrint"
                checked={form.autoPrint}
                onChange={(e) => setForm({ ...form, autoPrint: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="autoPrint" className="cursor-pointer">
                طباعة تلقائية عند إتمام الطلب
              </Label>
            </div>
            <div>
              <Label htmlFor="copies">عدد النسخ</Label>
              <Input
                id="copies"
                type="number"
                min="1"
                max="5"
                value={form.printCopies}
                onChange={(e) => setForm({ ...form, printCopies: parseInt(e.target.value) })}
                className="w-24"
              />
            </div>
          </div>
        </div>

        {/* Loyalty link */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-brand-700">برنامج الولاء</h2>
              <p className="text-sm text-brand-600 mt-1">
                تعديل نقاط الولاء وإعدادات الاسترداد
              </p>
            </div>
            <a
              href="/loyalty"
              className="px-4 py-2 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              الذهاب للولاء ←
            </a>
          </div>
        </div>

        {/* Error / success */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
            ✓ تم حفظ الإعدادات بنجاح
          </div>
        )}

        <div className="flex justify-start">
          <Button
            type="submit"
            disabled={saving}
            className="bg-brand-700 hover:bg-brand-600 text-white px-8"
            size="lg"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </form>
    </div>
  );
}
