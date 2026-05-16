import { prisma } from '@/lib/prisma';
import { LoyaltyClient } from './loyalty-client';

export const dynamic = 'force-dynamic';

export default async function LoyaltyPage() {
  const [config, customers] = await Promise.all([
    prisma.loyaltyConfig.findUnique({ where: { id: 'singleton' } }),
    prisma.customer.findMany({
      orderBy: { points: 'desc' },
    }).then((cs) =>
      cs.map((c) => ({
        ...c,
        lastVisitAt: c.lastVisitAt ? c.lastVisitAt.toISOString() : null,
      }))
    ),
  ]);

  const defaultConfig = {
    pointsPerUnit: 10,
    redemptionThreshold: 100,
    freeDrinkValue: 1.5,
    active: true,
    buyXGetYEnabled: false,
    buyX: 5,
    getY: 1,
  };

  const cfg = config
    ? {
        pointsPerUnit: config.pointsPerUnit,
        redemptionThreshold: config.redemptionThreshold,
        freeDrinkValue: config.freeDrinkValue,
        active: config.active,
        buyXGetYEnabled: config.buyXGetYEnabled,
        buyX: config.buyX,
        getY: config.getY,
      }
    : defaultConfig;

  return (
    <div className="p-6 bg-surface-50 min-h-full" dir="rtl">
      <LoyaltyClient config={cfg} customers={customers} />
    </div>
  );
}
