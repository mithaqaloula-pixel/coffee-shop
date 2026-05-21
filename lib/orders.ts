import type { OrderStatus } from "@prisma/client";

// Display metadata for each order status: an Arabic label and Tailwind classes
// for badges. Kept in one place so the student/worker UIs stay consistent.
export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; badgeClass: string; step: number }
> = {
  PENDING: {
    label: "بانتظار القبول",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    step: 1,
  },
  ACCEPTED: {
    label: "تم القبول",
    badgeClass: "bg-sky-100 text-sky-700 border-sky-200",
    step: 2,
  },
  IN_PROGRESS: {
    label: "جاري الغسيل",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    step: 3,
  },
  COMPLETED: {
    label: "اكتمل",
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    step: 4,
  },
  CANCELLED: {
    label: "ملغى",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    step: 0,
  },
};

// Statuses considered "active" — an order the student is currently tracking.
export const ACTIVE_STATUSES: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "IN_PROGRESS",
];

// Ordered steps for the tracking timeline (excludes CANCELLED).
export const TRACKING_STEPS: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
];

export const CAR_COLORS = [
  { value: "أبيض", className: "bg-white border" },
  { value: "أسود", className: "bg-black" },
  { value: "فضي", className: "bg-gray-300" },
  { value: "رمادي", className: "bg-gray-500" },
  { value: "أحمر", className: "bg-red-500" },
  { value: "أزرق", className: "bg-blue-500" },
  { value: "أخضر", className: "bg-green-500" },
  { value: "آخر", className: "bg-gradient-to-r from-pink-400 to-yellow-400" },
] as const;

/** Format Omani Rials. */
export function formatPrice(amount: number): string {
  return `${amount.toFixed(3)} ر.ع`;
}
