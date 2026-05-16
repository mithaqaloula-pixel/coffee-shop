import { prisma } from '@/lib/prisma';
import { ExpensesClient } from './expenses-client';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
  const [expenses, categories] = await Promise.all([
    prisma.expense.findMany({
      include: { category: true },
      orderBy: { expenseDate: 'desc' },
      take: 100,
    }),
    prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const serializable = expenses.map((e) => ({
    ...e,
    expenseDate: e.expenseDate.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  return (
    <div className="p-6 bg-surface-50 min-h-full" dir="rtl">
      <ExpensesClient expenses={serializable} categories={categories} />
    </div>
  );
}
