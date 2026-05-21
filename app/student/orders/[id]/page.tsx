import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { ar } from "@/lib/translations/ar";
import {
  ORDER_STATUS_META,
  TRACKING_STEPS,
  formatPrice,
} from "@/lib/orders";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { CancelOrderButton } from "./cancel-button";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default async function OrderTrackingPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireRole("STUDENT");
  const order = await prisma.order.findFirst({
    where: { id: params.id, studentId: user.id },
    include: {
      car: true,
      parkingLot: true,
      serviceType: true,
      worker: true,
    },
  });

  if (!order) notFound();

  const cancellable = order.status === "PENDING" || order.status === "ACCEPTED";
  const isCancelled = order.status === "CANCELLED";
  const currentStep = ORDER_STATUS_META[order.status].step;

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
        <h1 className="font-bold text-brand-700">{ar.orderStatus.title}</h1>
      </header>

      <section className="flex-1 space-y-4 p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm text-muted-foreground">
            {ar.orderStatus.orderNumber}#{order.id.slice(-6).toUpperCase()}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Timeline */}
        {!isCancelled ? (
          <Card>
            <CardContent className="p-5">
              <ol className="space-y-4">
                {TRACKING_STEPS.map((step) => {
                  const meta = ORDER_STATUS_META[step];
                  const done = currentStep >= meta.step;
                  const current = currentStep === meta.step;
                  return (
                    <li key={step} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs",
                          done
                            ? "border-brand-500 bg-brand-500 text-white"
                            : "border-input bg-muted text-muted-foreground",
                          current && "ring-2 ring-brand-200",
                        )}
                      >
                        {done ? <Check className="h-4 w-4" /> : meta.step}
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          done ? "font-medium" : "text-muted-foreground",
                        )}
                      >
                        {meta.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-5 text-center text-sm font-medium text-red-700">
              {ORDER_STATUS_META.CANCELLED.label}
            </CardContent>
          </Card>
        )}

        {/* Details */}
        <Card>
          <CardContent className="p-5">
            <DetailRow
              label={ar.orderStatus.car}
              value={`${order.car.plateNumber} — ${order.car.model ?? ""}`}
            />
            <DetailRow
              label={ar.orderStatus.parking}
              value={order.parkingLot.name}
            />
            <DetailRow
              label={ar.orderStatus.spot}
              value={order.spotCode ?? "—"}
            />
            <DetailRow
              label={ar.orderStatus.service}
              value={order.serviceType.nameAr}
            />
            <DetailRow
              label={ar.orderStatus.worker}
              value={order.worker?.name ?? ar.orderStatus.notAssigned}
            />
            {order.notes && (
              <DetailRow label={ar.orderStatus.notes} value={order.notes} />
            )}
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <span className="font-medium">{ar.order.total}</span>
              <span className="text-lg font-bold tabular-nums text-brand-700">
                {formatPrice(Number(order.totalPrice))}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        {(order.carPhotoUrl || order.afterPhotoUrl) && (
          <div className="grid grid-cols-2 gap-3">
            {order.carPhotoUrl && (
              <figure className="space-y-1">
                <figcaption className="text-xs text-muted-foreground">
                  {ar.orderStatus.beforePhoto}
                </figcaption>
                <div className="relative h-36 overflow-hidden rounded-xl border">
                  <Image
                    src={order.carPhotoUrl}
                    alt={ar.orderStatus.beforePhoto}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
              </figure>
            )}
            {order.afterPhotoUrl && (
              <figure className="space-y-1">
                <figcaption className="text-xs text-muted-foreground">
                  {ar.orderStatus.afterPhoto}
                </figcaption>
                <div className="relative h-36 overflow-hidden rounded-xl border">
                  <Image
                    src={order.afterPhotoUrl}
                    alt={ar.orderStatus.afterPhoto}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
              </figure>
            )}
          </div>
        )}

        {cancellable && <CancelOrderButton orderId={order.id} />}
      </section>
    </main>
  );
}
