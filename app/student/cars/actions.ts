"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { carSchema, type CarInput } from "@/lib/validations";
import { ACTIVE_STATUSES } from "@/lib/orders";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function addCar(input: CarInput): Promise<ActionResult> {
  const user = await requireRole("STUDENT");

  const parsed = carSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const { plateNumber, model, color, year } = parsed.data;
  await prisma.car.create({
    data: { userId: user.id, plateNumber, model, color, year },
  });

  revalidatePath("/student/cars");
  revalidatePath("/student/order/new");
  return { ok: true };
}

export async function deleteCar(carId: string): Promise<ActionResult> {
  const user = await requireRole("STUDENT");

  // Only allow deleting the student's own car.
  const car = await prisma.car.findFirst({
    where: { id: carId, userId: user.id },
  });
  if (!car) return { ok: false, error: "السيارة غير موجودة" };

  const activeOrder = await prisma.order.findFirst({
    where: { carId, status: { in: ACTIVE_STATUSES } },
  });
  if (activeOrder) {
    return { ok: false, error: "لا يمكن حذف سيارة لها طلب نشط" };
  }

  await prisma.car.delete({ where: { id: carId } });
  revalidatePath("/student/cars");
  return { ok: true };
}
