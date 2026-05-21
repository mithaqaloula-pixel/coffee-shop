import Link from "next/link";
import { ArrowRight, ChevronLeft, ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { ar } from "@/lib/translations/ar";
import { formatPrice } from "@/lib/orders";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/order-status-badge";

export default async function OrderHistoryPage() {
  const user = await requireRole("STUDENT");
  const orders = await prisma.order.findMany({
    where: { studentId: user.id },
    orderBy: { createdAt: "desc" },
    include: { car: true, serviceType: true },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-card px-5 py-4">
        <Link
          href="/student"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          {ar.common.back}
        </Link>
        <h1 className="flex items-center gap-2 font-bold text-brand-700">
          <ClipboardList className="h-5 w-5" />
          {ar.orderStatus.historyTitle}
        </h1>
      </header>

      <section className="flex-1 space-y-3 p-5">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center text-muted-foreground">
            <ClipboardList className="h-10 w-10" />
            <p>{ar.student.noOrders}</p>
          </div>
        ) : (
          orders.map((order) => (
            <Link key={order.id} href={`/student/orders/${order.id}`}>
              <Card className="transition hover:border-brand-300">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{order.serviceType.nameAr}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.car.plateNumber} ·{" "}
                      {order.createdAt.toLocaleDateString("ar-OM")}
                    </p>
                    <p className="text-sm font-bold tabular-nums text-brand-700">
                      {formatPrice(Number(order.totalPrice))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
