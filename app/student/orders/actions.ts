"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function cancelOrder(orderId: string): Promise<ActionResult> {
  const user = await requireRole("STUDENT");

  const order = await prisma.order.findFirst({
    where: { id: orderId, studentId: user.id },
  });
  if (!order) return { ok: false, error: "الطلب غير موجود" };

  // Students can only cancel before the wash has started.
  if (order.status !== "PENDING" && order.status !== "ACCEPTED") {
    return { ok: false, error: "لا يمكن إلغاء الطلب في هذه المرحلة" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/student");
  revalidatePath(`/student/orders/${orderId}`);
  return { ok: true };
}
