import { prisma } from '@/lib/prisma';
import { SuppliersClient } from './suppliers-client';

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      invoices: {
        select: { totalAmount: true, paidAmount: true, status: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  const data = suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    email: s.email,
    contactPerson: s.contactPerson,
    paymentTerms: s.paymentTerms,
    invoiceCount: s.invoices.length,
    outstandingBalance: s.invoices.reduce(
      (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
      0
    ),
  }));

  return (
    <div className="p-6 bg-surface-50 min-h-full" dir="rtl">
      <SuppliersClient suppliers={data} />
    </div>
  );
}
