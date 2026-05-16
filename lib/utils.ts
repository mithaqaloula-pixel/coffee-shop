import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Omani Rials with 3 decimal places. */
export function formatOMR(amount: number): string {
  return `${amount.toFixed(3)} ر.ع`;
}

/** Format a date in Arabic locale. */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ar-OM", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
