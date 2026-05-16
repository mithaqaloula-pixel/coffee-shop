import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, unit, quantity, unitCost, reorderThreshold, supplierId } = body;

    const item = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(unit !== undefined && { unit }),
        ...(quantity !== undefined && { quantity }),
        ...(unitCost !== undefined && { unitCost }),
        ...(reorderThreshold !== undefined && { reorderThreshold }),
        ...(supplierId !== undefined && { supplierId: supplierId || null }),
      },
      include: { supplier: true },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.inventoryItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
  }
}
