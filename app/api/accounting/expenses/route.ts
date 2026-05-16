import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const categoryId = searchParams.get('categoryId');

    const expenses = await prisma.expense.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(dateFrom || dateTo
          ? {
              expenseDate: {
                ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                ...(dateTo ? { lte: new Date(dateTo) } : {}),
              },
            }
          : {}),
      },
      include: { category: true },
      orderBy: { expenseDate: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, amount, expenseDate, description, paymentMethod, notes } = body;

    if (!categoryId || !amount || !expenseDate || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        categoryId,
        amount,
        expenseDate: new Date(expenseDate),
        description,
        paymentMethod: paymentMethod ?? 'cash',
        notes: notes ?? null,
      },
      include: { category: true },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
