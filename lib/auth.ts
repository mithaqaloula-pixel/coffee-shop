import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { verifyOtpSchema } from "@/lib/validations";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const parsed = verifyOtpSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { phone, otp } = parsed.data;
        if (!verifyOtp(phone, otp)) return null;

        // Find or create the user. New users have no name/role yet and are
        // routed to /onboarding by the JWT `needsOnboarding` flag.
        const user = await prisma.user.upsert({
          where: { phone },
          update: {},
          create: { phone },
        });

        return {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in: copy fields from the authorized user.
      if (user) {
        token.userId = user.id;
        token.phone = user.phone;
        token.role = user.role ?? null;
        token.name = user.name ?? null;
      }

      // Session update (e.g. after onboarding) — refresh from the DB.
      if (trigger === "update" && token.userId) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.userId as string },
        });
        if (fresh) {
          token.role = fresh.role ?? null;
          token.name = fresh.name ?? null;
        }
      }

      token.needsOnboarding = !token.role || !token.name;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.phone = token.phone as string;
        session.user.role = (token.role as typeof session.user.role) ?? null;
        session.user.name = (token.name as string) ?? null;
        session.user.needsOnboarding = Boolean(token.needsOnboarding);
      }
      return session;
    },
  },
};
