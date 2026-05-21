import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Role } from "@prisma/client";

/** Returns the current session, or null. */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

/**
 * Ensures the visitor is authenticated with the given role.
 * Routes are also protected by middleware; this is a defence-in-depth guard
 * for server components and actions, and gives us a typed user object.
 */
export async function requireRole(role: Role) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.needsOnboarding) redirect("/onboarding");
  if (user.role !== role) redirect("/");
  return user;
}
