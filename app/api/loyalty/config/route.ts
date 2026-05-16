import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await prisma.loyaltyConfig.findUnique({ where: { id: 'singleton' } });
    if (!config) {
      return NextResponse.json({ error: 'Loyalty config not found' }, { status: 404 });
    }
    return NextResponse.json(config);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch loyalty config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      pointsPerUnit,
      redemptionThreshold,
      freeDrinkValue,
      active,
      buyXGetYEnabled,
      buyX,
      getY,
    } = body;

    const config = await prisma.loyaltyConfig.upsert({
      where: { id: 'singleton' },
      update: {
        ...(pointsPerUnit !== undefined && { pointsPerUnit }),
        ...(redemptionThreshold !== undefined && { redemptionThreshold }),
        ...(freeDrinkValue !== undefined && { freeDrinkValue }),
        ...(active !== undefined && { active }),
        ...(buyXGetYEnabled !== undefined && { buyXGetYEnabled }),
        ...(buyX !== undefined && { buyX }),
        ...(getY !== undefined && { getY }),
      },
      create: {
        id: 'singleton',
        pointsPerUnit: pointsPerUnit ?? 10,
        redemptionThreshold: redemptionThreshold ?? 100,
        freeDrinkValue: freeDrinkValue ?? 1.5,
        active: active ?? true,
        buyXGetYEnabled: buyXGetYEnabled ?? false,
        buyX: buyX ?? 5,
        getY: getY ?? 1,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update loyalty config' }, { status: 500 });
  }
}
