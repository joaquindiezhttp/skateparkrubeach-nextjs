import { withAuth } from "next-auth/middleware";

// Protege /admin: si no hay sesión, redirige a /login.
export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/admin/:path*"],
};
