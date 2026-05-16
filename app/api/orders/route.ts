import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const orders = await prisma.order.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(dateFrom || dateTo
          ? {
              createdAt: {
                ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                ...(dateTo ? { lte: new Date(dateTo) } : {}),
              },
            }
          : {}),
      },
      include: {
        customer: true,
        cashier: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, phone, paymentMethod, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order must have at least one item' }, { status: 400 });
    }

    // Validate and compute totals
    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        recipe: {
          include: { items: { include: { inventoryItem: true } } },
        },
      },
    });

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const lineItems = items.map((i: { productId: string; quantity: number; notes?: string }) => {
      const product = productMap[i.productId];
      if (!product) throw new Error(`Product ${i.productId} not found`);
      const unitPrice = product.price;
      const lineTotal = +(unitPrice * i.quantity).toFixed(3);
      return {
        productId: i.productId,
        quantity: i.quantity,
        unitPrice,
        lineTotal,
        notes: i.notes ?? null,
      };
    });

    const subtotal = +lineItems.reduce((s: number, x: { lineTotal: number }) => s + x.lineTotal, 0).toFixed(3);

    // Get next order number
    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
    const orderNumber = settings?.nextOrderNumber ?? 1001;

    // Find or create customer
    let customerId: string | null = null;
    if (phone) {
      let customer = await prisma.customer.findUnique({ where: { phone } });
      if (!customer) {
        customer = await prisma.customer.create({
          data: { name: phone, phone },
        });
      }
      customerId = customer.id;
    }

    // Loyalty config
    const loyaltyConfig = await prisma.loyaltyConfig.findUnique({ where: { id: 'singleton' } });
    const pointsEarned = loyaltyConfig?.active
      ? Math.floor(subtotal * (loyaltyConfig.pointsPerUnit ?? 10))
      : 0;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        status: 'pending',
        paymentMethod: paymentMethod ?? 'cash',
        paymentStatus: 'paid',
        paidAt: new Date(),
        subtotal,
        total: subtotal,
        pointsEarned,
        notes: notes ?? null,
        items: { create: lineItems },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    // Increment order number
    await prisma.settings.upsert({
      where: { id: 'singleton' },
      update: { nextOrderNumber: orderNumber + 1 },
      create: { id: 'singleton', nextOrderNumber: orderNumber + 1 },
    });

    // Deduct inventory
    for (const item of items as { productId: string; quantity: number }[]) {
      const product = productMap[item.productId];
      if (!product?.recipe) continue;
      for (const ri of product.recipe.items) {
        const deduct = ri.quantity * item.quantity;
        const current = await prisma.inventoryItem.findUnique({ where: { id: ri.inventoryItemId } });
        if (!current) continue;
        const newQty = current.quantity - deduct;
        await prisma.inventoryItem.update({
          where: { id: ri.inventoryItemId },
          data: { quantity: Math.max(0, newQty) },
        });
        await prisma.inventoryLog.create({
          data: {
            inventoryItemId: ri.inventoryItemId,
            type: 'out',
            quantityDelta: -deduct,
            reason: 'order',
            reference: order.id,
            balanceAfter: Math.max(0, newQty),
          },
        });
      }
    }

    // Update customer loyalty points and stats
    if (customerId) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          points: { increment: pointsEarned },
          totalSpent: { increment: subtotal },
          visits: { increment: 1 },
          lastVisitAt: new Date(),
        },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
