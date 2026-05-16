import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const search = searchParams.get('search');

    if (phone) {
      const customer = await prisma.customer.findUnique({ where: { phone } });
      return NextResponse.json(customer);
    }

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { totalSpent: 'desc' },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    const customer = await prisma.customer.upsert({
      where: { phone },
      update: { name: name || phone },
      create: { name: name || phone, phone },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
