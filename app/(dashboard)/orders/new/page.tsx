'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatOMR } from '@/lib/utils';

type Product = {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  category: string;
  active: boolean;
};

type CartItem = {
  product: Product;
  quantity: number;
  notes: string;
};

const CATEGORIES = [
  { value: 'all', label: 'الكل' },
  { value: 'hot_coffee', label: '☕ قهوة ساخنة' },
  { value: 'iced_coffee', label: '🧊 قهوة باردة' },
  { value: 'tea', label: '🍵 شاي' },
  { value: 'juice', label: '🍊 عصائر' },
  { value: 'pastry', label: '🥐 مخبوزات' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'نقداً' },
  { value: 'thawani', label: 'ثواني' },
  { value: 'tap', label: 'تاب' },
];

const CATEGORY_EMOJI: Record<string, string> = {
  hot_coffee: '☕',
  iced_coffee: '🧊',
  tea: '🍵',
  juice: '🍊',
  pastry: '🥐',
};

export default function NewOrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [nextOrderNumber, setNextOrderNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmedOrderNum, setConfirmedOrderNum] = useState<number | null>(null);

  const loadProducts = useCallback(async () => {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      setProducts(data.filter((p: Product) => p.active));
    }
  }, []);

  const loadSettings = useCallback(async () => {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      setNextOrderNumber(data.nextOrderNumber);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadSettings();
  }, [loadProducts, loadSettings]);

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { product, quantity: 1, notes: '' }];
    });
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) => {
      return prev
        .map((c) =>
          c.product.id === productId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0);
    });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  }

  const subtotal = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);

  async function handleConfirmOrder() {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((c) => ({
            productId: c.product.id,
            quantity: c.quantity,
            notes: c.notes || null,
          })),
          phone: phone || undefined,
          paymentMethod,
        }),
      });
      if (!res.ok) throw new Error('فشل إنشاء الطلب');
      const order = await res.json();
      setConfirmedOrderNum(order.orderNumber);
      setSuccess(true);
      setCart([]);
      setPhone('');
      setNextOrderNumber((n) => (n ? n + 1 : null));
    } catch {
      alert('حدث خطأ أثناء تأكيد الطلب');
    } finally {
      setLoading(false);
    }
  }

  if (success && confirmedOrderNum) {
    return (
      <div className="flex items-center justify-center min-h-full bg-surface-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-brand-700 mb-2">تم تأكيد الطلب</h2>
          <p className="text-gray-500 mb-1">رقم الطلب</p>
          <p className="text-4xl font-bold text-gray-900 mb-6">#{confirmedOrderNum}</p>
          <Button
            className="w-full bg-brand-700 hover:bg-brand-600 text-white"
            onClick={() => setSuccess(false)}
          >
            طلب جديد
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-surface-50" dir="rtl">
      {/* Cart sidebar — RIGHT side in LTR but shows on LEFT in RTL */}
      <div className="w-80 lg:w-96 bg-white border-l border-surface-200 flex flex-col shadow-md">
        {/* Cart header */}
        <div className="p-4 border-b border-surface-200">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-brand-700">الطلب الحالي</h2>
            {nextOrderNumber && (
              <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full font-mono font-bold">
                #{nextOrderNumber}
              </span>
            )}
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 py-12 text-sm">
              <div className="text-4xl mb-3">🛒</div>
              اختر منتجات من القائمة
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="bg-surface-50 rounded-xl p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{item.product.nameAr}</p>
                    <p className="text-xs text-gray-500">{formatOMR(item.product.price)} / قطعة</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-gray-400 hover:text-red-500 text-sm mr-2"
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.product.id, -1)}
                      className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 font-bold text-sm flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.product.id, 1)}
                      className="w-7 h-7 rounded-full bg-brand-700 text-white hover:bg-brand-600 font-bold text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-brand-700 text-sm">
                    {formatOMR(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart footer */}
        <div className="p-4 border-t border-surface-200 space-y-4">
          {/* Phone */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">رقم الجوال (اختياري)</label>
            <Input
              type="tel"
              placeholder="+968 9XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-sm"
              dir="ltr"
            />
          </div>

          {/* Payment method */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">طريقة الدفع</label>
            <div className="flex gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setPaymentMethod(m.value)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-medium transition-colors border',
                    paymentMethod === m.value
                      ? 'bg-brand-700 text-white border-brand-700'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-surface-50 rounded-xl p-3 space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>المجموع الفرعي</span>
              <span className="font-mono">{formatOMR(subtotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-1 border-t border-surface-200 mt-1">
              <span className="text-gray-900">الإجمالي</span>
              <span className="text-brand-700 font-mono">{formatOMR(subtotal)}</span>
            </div>
          </div>

          <Button
            className="w-full bg-brand-700 hover:bg-brand-600 text-white h-12 text-base font-bold"
            onClick={handleConfirmOrder}
            disabled={cart.length === 0 || loading}
          >
            {loading ? 'جاري التأكيد...' : 'تأكيد الطلب ✓'}
          </Button>
        </div>
      </div>

      {/* Products area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Category tabs */}
        <div className="bg-white border-b border-surface-200 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  activeCategory === cat.value
                    ? 'bg-brand-700 text-white'
                    : 'bg-surface-50 text-gray-600 hover:bg-surface-100'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-xl border border-surface-200 p-4 text-right hover:border-brand-300 hover:shadow-md active:scale-95 transition-all group"
              >
                <div className="text-3xl mb-2 text-center">
                  {CATEGORY_EMOJI[product.category] ?? '☕'}
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">{product.nameAr}</p>
                <p className="text-xs text-gray-400 mb-2">{product.nameEn}</p>
                <p className="text-brand-700 font-bold font-mono">{formatOMR(product.price)}</p>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400">
                لا توجد منتجات
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
