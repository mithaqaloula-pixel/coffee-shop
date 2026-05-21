import Link from "next/link";
import { ArrowRight, Car as CarIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { ar } from "@/lib/translations/ar";
import { Button } from "@/components/ui/button";
import { AddCarDialog, CarCard } from "./cars-client";

export default async function CarsPage() {
  const user = await requireRole("STUDENT");
  const cars = await prisma.car.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
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
          <CarIcon className="h-5 w-5" />
          {ar.cars.title}
        </h1>
      </header>

      <section className="flex-1 space-y-4 p-5">
        <div className="flex justify-end">
          <AddCarDialog />
        </div>

        {cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500">
              <CarIcon className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold">{ar.cars.emptyTitle}</h2>
            <p className="max-w-xs text-sm text-muted-foreground">
              {ar.cars.emptyBody}
            </p>
            <AddCarDialog />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {cars.map((car) => (
              <CarCard
                key={car.id}
                id={car.id}
                plateNumber={car.plateNumber}
                model={car.model}
                color={car.color}
                year={car.year}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
