import { NextResponse } from "next/server";
import { sendOtp } from "@/lib/otp";
import { requestOtpSchema } from "@/lib/validations";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = requestOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_PHONE", message: parsed.error.issues[0]?.message },
      { status: 400 },
    );
  }

  await sendOtp(parsed.data.phone);
  return NextResponse.json({ ok: true });
}
