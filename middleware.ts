import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Authenticated but incomplete profile → force onboarding first.
    if (token?.needsOnboarding && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    const role = token?.role;

    const guard = (required: string) => {
      if (role !== required) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return null;
    };

    if (pathname.startsWith("/student")) return guard("STUDENT");
    if (pathname.startsWith("/worker")) return guard("WORKER");
    if (pathname.startsWith("/admin")) return guard("ADMIN");

    return NextResponse.next();
  },
  {
    callbacks: {
      // Run the middleware function only when a valid token exists; otherwise
      // redirect to the sign-in page.
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  },
);

export const config = {
  matcher: ["/student/:path*", "/worker/:path*", "/admin/:path*", "/onboarding"],
};
