'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn, formatOMR } from '@/lib/utils';

type InventoryItem = { id: string; name: string; unit: string; unitCost: number };
type RecipeItem = { inventoryItemId: string; quantity: number; inventoryItem: InventoryItem };
type Recipe = { items: RecipeItem[] };
type Product = {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  category: string;
  active: boolean;
  recipe: Recipe | null;
};

type Props = {
  products: Product[];
  inventoryItems: InventoryItem[];
};

const CATEGORIES = [
  { value: 'all', label: 'الكل' },
  { value: 'hot_coffee', label: 'قهوة ساخنة' },
  { value: 'iced_coffee', label: 'قهوة باردة' },
  { value: 'tea', label: 'شاي' },
  { value: 'juice', label: 'عصائر' },
  { value: 'pastry', label: 'مخبوزات' },
];

function getCategoryLabel(cat: string) {
  return CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}

function calcCost(recipe: Recipe | null): number {
  if (!recipe) return 0;
  return recipe.items.reduce((sum, ri) => {
    return sum + ri.quantity * (ri.inventoryItem?.unitCost ?? 0);
  }, 0);
}

type FormRecipeRow = { inventoryItemId: string; quantity: string };
type FormData = {
  nameAr: string;
  nameEn: string;
  price: string;
  category: string;
  active: boolean;
  recipe: FormRecipeRow[];
};

const emptyForm: FormData = {
  nameAr: '',
  nameEn: '',
  price: '',
  category: 'hot_coffee',
  active: true,
  recipe: [{ inventoryItemId: '', quantity: '' }],
};

export function MenuClient({ products: initial, inventoryItems }: Props) {
  const [products, setProducts] = useState(initial);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  function openAdd() {
    setEditProduct(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      price: String(p.price),
      category: p.category,
      active: p.active,
      recipe:
        p.recipe?.items.map((ri) => ({
          inventoryItemId: ri.inventoryItemId,
          quantity: String(ri.quantity),
        })) ?? [{ inventoryItemId: '', quantity: '' }],
    });
    setError('');
    setShowModal(true);
  }

  function addRecipeRow() {
    setForm({ ...form, recipe: [...form.recipe, { inventoryItemId: '', quantity: '' }] });
  }

  function removeRecipeRow(idx: number) {
    setForm({ ...form, recipe: form.recipe.filter((_, i) => i !== idx) });
  }

  function updateRecipeRow(idx: number, field: keyof FormRecipeRow, value: string) {
    const updated = form.recipe.map((row, i) =>
      i === idx ? { ...row, [field]: value } : row
    );
    setForm({ ...form, recipe: updated });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      nameAr: form.nameAr,
      nameEn: form.nameEn,
      price: parseFloat(form.price),
      category: form.category,
      active: form.active,
      recipeItems: form.recipe
        .filter((r) => r.inventoryItemId && r.quantity)
        .map((r) => ({ inventoryItemId: r.inventoryItemId, quantity: parseFloat(r.quantity) })),
    };

    try {
      if (editProduct) {
        const res = await fetch(`/api/products/${editProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('فشل التحديث');
        const updated = await res.json();
        setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('فشل الإضافة');
        const created = await res.json();
        setProducts([...products, created]);
      }
      setShowModal(false);
    } catch {
      setError('حدث خطأ، يرجى المحاولة مجدداً');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل تريد حذف هذا المنتج؟')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter((p) => p.id !== id));
    } catch {
      alert('فشل الحذف');
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">قائمة المنتجات</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} منتج</p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-brand-700 hover:bg-brand-600 text-white"
        >
          + إضافة منتج
        </Button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              activeCategory === cat.value
                ? 'bg-brand-700 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-surface-50'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((product) => {
          const cost = calcCost(product.recipe);
          const margin =
            product.price > 0 ? ((product.price - cost) / product.price) * 100 : 0;

          return (
            <div
              key={product.id}
              className={cn(
                'bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden',
                !product.active && 'opacity-60'
              )}
            >
              {/* Image placeholder */}
              <div className="h-32 bg-gradient-to-br from-brand-100 to-surface-200 flex items-center justify-center">
                <span className="text-4xl">
                  {product.category === 'hot_coffee' ? '☕' :
                   product.category === 'iced_coffee' ? '🧊' :
                   product.category === 'tea' ? '🍵' :
                   product.category === 'juice' ? '🍊' :
                   product.category === 'pastry' ? '🥐' : '☕'}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="font-bold text-gray-900">{product.nameAr}</h3>
                    <p className="text-xs text-gray-500">{product.nameEn}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs bg-brand-50 text-brand-700 border-brand-200"
                  >
                    {getCategoryLabel(product.category)}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-brand-700">{formatOMR(product.price)}</span>
                  {!product.active && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">غير نشط</span>
                  )}
                </div>

                <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                  <div>التكلفة: {formatOMR(cost)}</div>
                  <div>
                    الهامش:{' '}
                    <span className={cn('font-medium', margin >= 50 ? 'text-emerald-600' : margin >= 30 ? 'text-amber-600' : 'text-red-600')}>
                      {margin.toFixed(1)}%
                    </span>
                  </div>
                  {product.recipe && (
                    <div className="mt-1 text-gray-400">
                      {product.recipe.items.length} مكوّن في الوصفة
                    </div>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 font-medium transition-colors"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            لا توجد منتجات في هذه الفئة
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-bold text-brand-700 mb-4">
                {editProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="nameAr">الاسم بالعربية</Label>
                    <Input
                      id="nameAr"
                      value={form.nameAr}
                      onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                    <Input
                      id="nameEn"
                      value={form.nameEn}
                      onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="price">السعر (ر.ع)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="any"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">الفئة</Label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full h-10 rounded-lg border border-input px-3 text-sm bg-background"
                    >
                      {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="active" className="cursor-pointer">نشط (معروض في القائمة)</Label>
                </div>

                {/* Recipe builder */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>الوصفة (المكوّنات)</Label>
                    <button
                      type="button"
                      onClick={addRecipeRow}
                      className="text-xs text-brand-700 hover:underline"
                    >
                      + إضافة مكوّن
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.recipe.map((row, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <select
                          value={row.inventoryItemId}
                          onChange={(e) => updateRecipeRow(idx, 'inventoryItemId', e.target.value)}
                          className="flex-1 h-9 rounded-lg border border-input px-2 text-sm bg-background"
                        >
                          <option value="">— اختر صنفاً —</option>
                          {inventoryItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({item.unit})
                            </option>
                          ))}
                        </select>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="الكمية"
                          value={row.quantity}
                          onChange={(e) => updateRecipeRow(idx, 'quantity', e.target.value)}
                          className="w-24"
                        />
                        <button
                          type="button"
                          onClick={() => removeRecipeRow(idx)}
                          className="text-red-500 hover:text-red-700 text-lg leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
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
                    {loading ? 'جاري الحفظ...' : editProduct ? 'حفظ التغييرات' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
