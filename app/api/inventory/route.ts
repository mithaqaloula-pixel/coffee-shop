import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      include: { supplier: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, unit, quantity, unitCost, reorderThreshold, supplierId } = body;

    if (!name || !unit) {
      return NextResponse.json({ error: 'Name and unit are required' }, { status: 400 });
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        unit,
        quantity: quantity ?? 0,
        unitCost: unitCost ?? 0,
        reorderThreshold: reorderThreshold ?? 0,
        supplierId: supplierId || null,
      },
      include: { supplier: true },
    });

    if (quantity > 0) {
      await prisma.inventoryLog.create({
        data: {
          inventoryItemId: item.id,
          type: 'in',
          quantityDelta: quantity,
          reason: 'restock',
          unitCost: unitCost ?? 0,
          balanceAfter: quantity,
        },
      });
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}
