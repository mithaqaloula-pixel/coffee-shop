"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validations";

type ActionResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export async function createOrder(
  input: CreateOrderInput,
): Promise<ActionResult> {
  const user = await requireRole("STUDENT");

  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة",
    };
  }
  const data = parsed.data;

  // Validate that the referenced records exist and belong to / are usable by
  // the student. Price is taken from the server-side service record — never
  // trusted from the client.
  const [car, parkingLot, service] = await Promise.all([
    prisma.car.findFirst({ where: { id: data.carId, userId: user.id } }),
    prisma.parkingLot.findFirst({ where: { id: data.parkingLotId, isActive: true } }),
    prisma.serviceType.findFirst({ where: { id: data.serviceTypeId, isActive: true } }),
  ]);

  if (!car) return { ok: false, error: "السيارة غير موجودة" };
  if (!parkingLot) return { ok: false, error: "الموقف غير متاح" };
  if (!service) return { ok: false, error: "نوع الخدمة غير متاح" };

  const order = await prisma.order.create({
    data: {
      studentId: user.id,
      carId: car.id,
      parkingLotId: parkingLot.id,
      serviceTypeId: service.id,
      spotCode: data.spotCode,
      carPhotoUrl: data.carPhotoUrl || null,
      notes: data.notes || null,
      totalPrice: service.price,
      status: "PENDING",
    },
  });

  revalidatePath("/student");
  return { ok: true, orderId: order.id };
}
