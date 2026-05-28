import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignOutButton from "./sign-out-button";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Panel de gestión</h1>
          <SignOutButton />
        </div>
        <p className="text-neutral-400">
          Sesión iniciada como{" "}
          <span className="text-yellow-400 font-semibold">
            {session.user?.name}
          </span>
          .
        </p>
        <p className="mt-4 text-neutral-500">
          Acá irá la lista de inscriptos (por construir en esta versión Next.js).
        </p>
      </div>
    </main>
  );
}
