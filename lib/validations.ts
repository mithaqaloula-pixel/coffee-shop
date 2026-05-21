import { z } from "zod";

// Omani mobile numbers: country code 968 + 8 digits starting with 7 or 9.
// We keep it permissive (9–12 digits) to ease local testing with the seeded
// demo accounts, but require a sensible length.
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d{9,12}$/, { message: "رقم الجوال غير صحيح" });

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, { message: "رمز التحقق يجب أن يكون 6 أرقام" });

export const requestOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

export const onboardingSchema = z.object({
  name: z.string().trim().min(2, { message: "الاسم مطلوب" }).max(60),
  role: z.enum(["STUDENT", "WORKER"], {
    errorMap: () => ({ message: "اختر نوع الحساب" }),
  }),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;

// ── Cars ──────────────────────────────────────────────────────────────────
const currentYear = new Date().getFullYear();

export const carSchema = z.object({
  plateNumber: z.string().trim().min(1, { message: "رقم اللوحة مطلوب" }).max(20),
  model: z.string().trim().min(1, { message: "الموديل مطلوب" }).max(60),
  color: z.string().trim().min(1, { message: "اللون مطلوب" }).max(20),
  year: z.coerce
    .number()
    .int()
    .min(1980, { message: "سنة غير صحيحة" })
    .max(currentYear + 1, { message: "سنة غير صحيحة" })
    .optional(),
});

export type CarInput = z.infer<typeof carSchema>;

// ── Orders ──────────────────────────────────────────────────────────────────
export const createOrderSchema = z.object({
  carId: z.string().min(1, { message: "اختر سيارتك" }),
  parkingLotId: z.string().min(1, { message: "اختر الموقف" }),
  serviceTypeId: z.string().min(1, { message: "اختر نوع الخدمة" }),
  spotCode: z
    .string()
    .trim()
    .min(1, { message: "رمز الموقف مطلوب" })
    .max(10),
  carPhotoUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
