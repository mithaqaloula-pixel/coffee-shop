import { prisma } from '@/lib/prisma';
import { InventoryClient } from './inventory-client';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const [items, suppliers] = await Promise.all([
    prisma.inventoryItem.findMany({
      include: { supplier: true },
      orderBy: { name: 'asc' },
    }),
    prisma.supplier.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const lowStock = items.filter((i) => i.quantity <= i.reorderThreshold);

  return (
    <div className="p-6 bg-surface-50 min-h-full">
      {lowStock.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <span className="font-semibold">تنبيه: </span>
          {lowStock.length} أصناف وصلت إلى الحد الأدنى:{' '}
          {lowStock.map((i) => i.name).join(' • ')}
        </div>
      )}
      <InventoryClient items={items} suppliers={suppliers} />
    </div>
  );
}
