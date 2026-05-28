import InscripcionForm from "@/components/InscripcionForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-md px-5 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            SKATEPARK <span className="text-yellow-400">PERUBEACH</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Clases · Lun · Mié · Jue · 17 a 21 hs
          </p>
        </header>

        <InscripcionForm />

        <footer className="mt-10 text-center text-xs text-neutral-600">
          Skatepark Perubeach · Bs As
        </footer>
      </div>
    </main>
  );
}
