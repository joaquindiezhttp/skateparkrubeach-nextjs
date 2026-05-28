import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignOutButton from "./sign-out-button";
import AdminPanel from "@/components/AdminPanel";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel de gestión</h1>
            <p className="text-sm text-neutral-400">
              Sesión: <span className="font-semibold text-yellow-400">{session.user?.name}</span>
            </p>
          </div>
          <SignOutButton />
        </div>
        <AdminPanel />
      </div>
    </main>
  );
}
