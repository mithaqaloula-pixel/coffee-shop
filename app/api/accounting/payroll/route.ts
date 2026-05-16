import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const entries = await prisma.payrollEntry.findMany({
      where: { month: targetMonth, year: targetYear },
      include: {
        employee: { select: { id: true, name: true, role: true, phone: true } },
      },
      orderBy: { employee: { name: 'asc' } },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch payroll' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, entryId, employeeId, month, year, baseSalary, bonus, deductions, overtime, netPay } = body;

    // Mark a payroll entry as paid
    if (action === 'markPaid' && entryId) {
      const entry = await prisma.payrollEntry.update({
        where: { id: entryId },
        data: { status: 'paid', paidDate: new Date() },
        include: { employee: true },
      });

      // Create expense record for payroll
      const salaryCat = await prisma.expenseCategory.findFirst({
        where: { systemKey: 'salaries' },
      });
      if (salaryCat) {
        await prisma.expense.create({
          data: {
            categoryId: salaryCat.id,
            amount: entry.netPay,
            expenseDate: new Date(),
            description: `راتب ${entry.employee.name} ${String(entry.month).padStart(2, '0')}/${entry.year}`,
            paymentMethod: 'bank',
            source: 'payroll',
            sourceId: entry.id,
          },
        });
      }

      return NextResponse.json(entry);
    }

    // Create a new payroll entry
    if (!employeeId || !month || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const entry = await prisma.payrollEntry.upsert({
      where: {
        employeeId_month_year: { employeeId, month: parseInt(month), year: parseInt(year) },
      },
      update: {
        baseSalary: baseSalary ?? undefined,
        bonus: bonus ?? undefined,
        deductions: deductions ?? undefined,
        overtime: overtime ?? undefined,
        netPay: netPay ?? undefined,
      },
      create: {
        employeeId,
        month: parseInt(month),
        year: parseInt(year),
        baseSalary: baseSalary ?? 0,
        bonus: bonus ?? 0,
        deductions: deductions ?? 0,
        overtime: overtime ?? 0,
        netPay: netPay ?? baseSalary ?? 0,
        status: 'pending',
      },
      include: {
        employee: { select: { id: true, name: true, role: true, phone: true } },
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process payroll' }, { status: 500 });
  }
}
