import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Login de admin único: usuario + contraseña (hash bcrypt) desde variables
// de entorno. Ver .env.local (ADMIN_USERNAME / ADMIN_PASSWORD_HASH).
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const adminUser = process.env.ADMIN_USERNAME;
        const adminHash = process.env.ADMIN_PASSWORD_HASH;
        if (!credentials?.username || !credentials?.password) return null;
        if (!adminUser || !adminHash) return null;
        if (credentials.username !== adminUser) return null;

        const ok = await bcrypt.compare(credentials.password, adminHash);
        if (!ok) return null;

        return { id: "admin", name: adminUser };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};
