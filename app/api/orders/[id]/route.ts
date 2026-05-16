import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, paymentStatus, paymentMethod, notes } = body;

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (paymentStatus !== undefined) data.paymentStatus = paymentStatus;
    if (paymentMethod !== undefined) data.paymentMethod = paymentMethod;
    if (notes !== undefined) data.notes = notes;

    if (status === 'completed') {
      data.completedAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data,
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
