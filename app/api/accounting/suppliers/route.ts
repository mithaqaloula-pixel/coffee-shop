import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        invoices: {
          select: {
            id: true,
            totalAmount: true,
            paidAmount: true,
            status: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const enriched = suppliers.map((s) => {
      const outstanding = s.invoices.reduce(
        (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
        0
      );
      return {
        ...s,
        invoiceCount: s.invoices.length,
        outstandingBalance: outstanding,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, address, contactPerson, paymentTerms, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        phone: phone ?? null,
        email: email ?? null,
        address: address ?? null,
        contactPerson: contactPerson ?? null,
        paymentTerms: paymentTerms ?? 'cash',
        notes: notes ?? null,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}
