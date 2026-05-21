import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: parsed.error.issues[0]?.message },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, role: parsed.data.role },
  });

  return NextResponse.json({ ok: true, role: parsed.data.role });
}
