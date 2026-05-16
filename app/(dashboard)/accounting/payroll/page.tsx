import { prisma } from '@/lib/prisma';
import { PayrollClient } from './payroll-client';

export const dynamic = 'force-dynamic';

export default async function PayrollPage() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const entries = await prisma.payrollEntry.findMany({
    where: { month: currentMonth, year: currentYear },
    include: {
      employee: {
        select: { id: true, name: true, role: true, phone: true },
      },
    },
    orderBy: { employee: { name: 'asc' } },
  });

  // If no payroll entries for current month, create them from active employees
  let payrollData = entries;
  if (entries.length === 0) {
    const employees = await prisma.employee.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
    payrollData = await Promise.all(
      employees.map((emp) =>
        prisma.payrollEntry.upsert({
          where: {
            employeeId_month_year: {
              employeeId: emp.id,
              month: currentMonth,
              year: currentYear,
            },
          },
          update: {},
          create: {
            employeeId: emp.id,
            month: currentMonth,
            year: currentYear,
            baseSalary: emp.salary,
            bonus: 0,
            deductions: 0,
            overtime: 0,
            netPay: emp.salary,
            status: 'pending',
          },
          include: {
            employee: { select: { id: true, name: true, role: true, phone: true } },
          },
        })
      )
    );
  }

  const serializable = payrollData.map((e) => ({
    ...e,
    paidDate: e.paidDate ? e.paidDate.toISOString() : null,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  return (
    <div className="p-6 bg-surface-50 min-h-full" dir="rtl">
      <PayrollClient
        entries={serializable}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
    </div>
  );
}
