import Link from "next/link";
import { Car, ChevronLeft, ClipboardList, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { ar } from "@/lib/translations/ar";
import { ACTIVE_STATUSES, formatPrice } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { OrderStatusBadge } from "@/components/order-status-badge";

export default async function StudentHomePage() {
  const user = await requireRole("STUDENT");

  const [activeOrder, recentOrders] = await Promise.all([
    prisma.order.findFirst({
      where: { studentId: user.id, status: { in: ACTIVE_STATUSES } },
      orderBy: { createdAt: "desc" },
      include: { car: true, serviceType: true },
    }),
    prisma.order.findMany({
      where: { studentId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { car: true, serviceType: true },
    }),
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-card px-5 py-4">
        <div>
          <p className="text-xs text-muted-foreground">{ar.appName}</p>
          <h1 className="text-lg font-bold">
            {ar.student.welcome} {user.name} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/student/cars">
              <Car className="h-4 w-4" />
              {ar.student.myCars}
            </Link>
          </Button>
          <LogoutButton />
        </div>
      </header>

      <section className="flex-1 space-y-6 p-5">
        {/* Active order */}
        {activeOrder ? (
          <Card className="border-brand-200 bg-brand-50/60">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium">{ar.student.activeOrder}</p>
                <OrderStatusBadge status={activeOrder.status} />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{activeOrder.serviceType.nameAr}</p>
                <p>
                  {activeOrder.car.plateNumber} · {formatPrice(Number(activeOrder.totalPrice))}
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href={`/student/orders/${activeOrder.id}`}>
                  {ar.student.trackOrder}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            {ar.student.noActiveOrder}
          </p>
        )}

        {/* Order CTA */}
        <Button
          asChild
          size="xl"
          className="h-24 w-full text-xl shadow-lg shadow-brand-500/20"
        >
          <Link href="/student/order/new">
            <Sparkles className="h-6 w-6" />
            {ar.student.orderNow} 🚗
          </Link>
        </Button>

        {/* Recent orders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold">
              <ClipboardList className="h-5 w-5 text-brand-600" />
              {ar.student.recentOrders}
            </h2>
            {recentOrders.length > 0 && (
              <Link
                href="/student/orders"
                className="text-sm text-brand-600 hover:underline"
              >
                {ar.student.viewAll}
              </Link>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
              {ar.student.noOrders}
            </p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/student/orders/${order.id}`}>
                  <Card className="transition hover:border-brand-300">
                    <CardContent className="flex items-center justify-between gap-3 p-4">
                      <div className="space-y-0.5">
                        <p className="font-medium">{order.serviceType.nameAr}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.car.plateNumber} ·{" "}
                          {order.createdAt.toLocaleDateString("ar-OM")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
