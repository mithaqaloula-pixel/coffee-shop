import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    phone: string;
    role: Role | null;
    name?: string | null;
  }

  interface Session {
    user: {
      id: string;
      phone: string;
      role: Role | null;
      needsOnboarding: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    phone?: string;
    role?: Role | null;
    needsOnboarding?: boolean;
  }
}
