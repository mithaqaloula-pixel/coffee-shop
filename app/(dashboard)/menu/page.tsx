import { prisma } from '@/lib/prisma';
import { MenuClient } from './menu-client';

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const [products, inventoryItems] = await Promise.all([
    prisma.product.findMany({
      include: {
        recipe: {
          include: {
            items: { include: { inventoryItem: true } },
          },
        },
      },
      orderBy: [{ category: 'asc' }, { nameAr: 'asc' }],
    }),
    prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="p-6 bg-surface-50 min-h-full">
      <MenuClient products={products} inventoryItems={inventoryItems} />
    </div>
  );
}
