import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { quantity, unitCost } = body;

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be positive' }, { status: 400 });
    }

    const current = await prisma.inventoryItem.findUnique({ where: { id: params.id } });
    if (!current) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Weighted average cost
    const newUnitCost = unitCost !== undefined ? unitCost : current.unitCost;
    const totalOldValue = current.quantity * current.unitCost;
    const totalNewValue = quantity * newUnitCost;
    const newQuantity = current.quantity + quantity;
    const weightedAvgCost = newQuantity > 0 ? (totalOldValue + totalNewValue) / newQuantity : newUnitCost;

    const updated = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: {
        quantity: newQuantity,
        unitCost: weightedAvgCost,
      },
    });

    await prisma.inventoryLog.create({
      data: {
        inventoryItemId: params.id,
        type: 'in',
        quantityDelta: quantity,
        reason: 'restock',
        unitCost: newUnitCost,
        balanceAfter: newQuantity,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to restock item' }, { status: 500 });
  }
}
