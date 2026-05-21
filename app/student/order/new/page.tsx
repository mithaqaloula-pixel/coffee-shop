import Link from "next/link";
import { ArrowRight, CarFront } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { ar } from "@/lib/translations/ar";
import { Button } from "@/components/ui/button";
import { OrderForm } from "./order-form";

export default async function NewOrderPage() {
  const user = await requireRole("STUDENT");

  const [cars, parkingLots, services] = await Promise.all([
    prisma.car.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.parkingLot.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.serviceType.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    }),
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-card px-5 py-4">
        <Link
          href="/student"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          {ar.common.back}
        </Link>
        <h1 className="flex items-center gap-2 font-bold text-brand-700">
          <CarFront className="h-5 w-5" />
          {ar.order.newTitle}
        </h1>
      </header>

      <section className="flex-1 p-5">
        {cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-16 text-center">
            <h2 className="text-lg font-bold">{ar.order.noCarsTitle}</h2>
            <p className="max-w-xs text-sm text-muted-foreground">
              {ar.order.noCarsBody}
            </p>
            <Button asChild>
              <Link href="/student/cars">{ar.order.goToCars}</Link>
            </Button>
          </div>
        ) : (
          <OrderForm
            cars={cars.map((c) => ({
              id: c.id,
              label: `${c.plateNumber} — ${c.model ?? ""}`,
            }))}
            parkingLots={parkingLots.map((p) => ({ id: p.id, name: p.name }))}
            services={services.map((s) => ({
              id: s.id,
              nameAr: s.nameAr,
              price: Number(s.price),
              durationMinutes: s.durationMinutes,
            }))}
          />
        )}
      </section>
    </main>
  );
}
