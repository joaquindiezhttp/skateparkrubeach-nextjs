"use client";

import { useEffect, useState } from "react";
import {
  CATEGORIAS,
  DIAS,
  MAX_POR_CATEGORIA,
  getCupos,
  crearInscripcion,
  crearMembresia,
  whatsappLink,
  type Categoria,
  type Dia,
  type Cupos,
} from "@/lib/api";

export default function InscripcionForm() {
  const [cupos, setCupos] = useState<Cupos | null>(null);
  const [categoria, setCategoria] = useState<Categoria | "">("");
  const [dia, setDia] = useState<Dia | "">("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [membresia, setMembresia] = useState(false);
  const [precio, setPrecio] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState<{ nombre: string; detalle: string; wa: string } | null>(null);

  async function cargarCupos() {
    try {
      setCupos(await getCupos());
    } catch {
      setError("No se pudo conectar con el servidor. ¿Está corriendo el backend?");
    }
  }

  useEffect(() => {
    cargarCupos();
  }, []);

  const restantes = (cat: string) => cupos?.[cat]?.remaining ?? MAX_POR_CATEGORIA;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!categoria) return setError("Elegí una categoría.");
    if (!dia) return setError("Elegí un día.");
    if (nombre.trim().length < 2) return setError("Escribí tu nombre completo.");
    if (telefono.replace(/\D/g, "").length < 6) return setError("Ingresá un teléfono válido.");

    let precioNum: number | null = null;
    if (membresia) {
      precioNum = Number(precio);
      if (!Number.isFinite(precioNum) || precioNum <= 0) {
        return setError("Ingresá un precio de membresía válido.");
      }
    }
    if (cupos && restantes(categoria) <= 0) {
      return setError(`La categoría ${categoria} está completa. Elegí otra.`);
    }

    setLoading(true);
    try {
      const ins = await crearInscripcion({
        name: nombre.trim(),
        phone: telefono.trim(),
        category: categoria,
        day: dia,
      });
      if (membresia && precioNum !== null) {
        await crearMembresia(ins.id, precioNum);
      }

      let msg = `Hola! Quiero inscribirme a la clase de ${categoria} el ${dia}. Mi nombre es ${nombre.trim()} y mi tel es ${telefono.trim()}`;
      if (membresia && precioNum !== null) msg += ` (con membresía $${precioNum})`;

      setExito({
        nombre: nombre.trim().split(" ")[0],
        detalle: `${categoria} · ${dia} · 17 a 21 hs`,
        wa: whatsappLink(msg),
      });
    } catch (err) {
      await cargarCupos();
      setError(err instanceof Error ? err.message : "No se pudo guardar la inscripción.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setCategoria("");
    setDia("");
    setNombre("");
    setTelefono("");
    setMembresia(false);
    setPrecio("");
    setError("");
    setExito(null);
    cargarCupos();
  }

  // ---- Pantalla de éxito ----
  if (exito) {
    return (
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-yellow-400 text-2xl font-bold text-black">
          ✓
        </div>
        <h2 className="text-2xl font-bold">¡Casi listo, {exito.nombre}!</h2>
        <p className="mt-2 text-neutral-400">
          Guardamos tu lugar en <span className="text-white">{exito.detalle}</span>. Tocá el
          botón para <span className="text-white">confirmar por WhatsApp</span>.
        </p>
        <a
          href={exito.wa}
          target="_blank"
          rel="noopener"
          className="mt-5 block rounded bg-yellow-400 py-3 font-bold text-black hover:bg-yellow-300"
        >
          Confirmar por WhatsApp
        </a>
        <button
          type="button"
          onClick={reset}
          className="mt-3 w-full rounded border border-neutral-700 py-2 text-sm font-medium hover:border-yellow-400"
        >
          Inscribir a otra persona
        </button>
      </div>
    );
  }

  // ---- Formulario ----
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Categoría */}
      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-yellow-400">
          1 · Elegí tu categoría
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIAS.map((cat) => {
            const left = restantes(cat);
            const full = cupos != null && left <= 0;
            const selected = categoria === cat;
            return (
              <button
                key={cat}
                type="button"
                disabled={full}
                onClick={() => {
                  setCategoria(cat);
                  setError("");
                }}
                className={[
                  "rounded border-2 p-3 text-left transition",
                  selected
                    ? "border-yellow-400 bg-yellow-400 text-black"
                    : "border-neutral-800 bg-neutral-900 hover:border-neutral-600",
                  full ? "cursor-not-allowed opacity-40" : "",
                ].join(" ")}
              >
                <span className="block text-lg font-bold leading-tight">{cat}</span>
                <span className={`block text-xs ${selected ? "text-black/70" : "text-neutral-400"}`}>
                  {cupos == null ? "…" : full ? "COMPLETO" : `Quedan ${left} / ${MAX_POR_CATEGORIA}`}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Día */}
      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-yellow-400">
          2 · Elegí el día
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {DIAS.map((d) => {
            const selected = dia === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDia(d);
                  setError("");
                }}
                className={[
                  "rounded border-2 py-3 text-center text-sm font-semibold transition",
                  selected
                    ? "border-yellow-400 bg-yellow-400 text-black"
                    : "border-neutral-800 bg-neutral-900 hover:border-neutral-600",
                ].join(" ")}
              >
                {d}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Datos */}
      <fieldset className="space-y-3">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-yellow-400">
          3 · Tus datos
        </legend>
        <div>
          <label className="mb-1 block text-sm text-neutral-400">Nombre y apellido</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="name"
            placeholder="Tu nombre"
            className="w-full rounded border-2 border-neutral-800 bg-neutral-900 px-3 py-2 outline-none focus:border-yellow-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-400">Teléfono</label>
          <input
            type="tel"
            inputMode="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            autoComplete="tel"
            placeholder="11 5555 5555"
            className="w-full rounded border-2 border-neutral-800 bg-neutral-900 px-3 py-2 outline-none focus:border-yellow-400"
          />
        </div>
      </fieldset>

      {/* Membresía */}
      <fieldset className="space-y-3">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-yellow-400">
          4 · Membresía (opcional)
        </legend>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={membresia}
            onChange={(e) => setMembresia(e.target.checked)}
            className="h-5 w-5 accent-yellow-400"
          />
          <span className="font-medium">Quiero sumar membresía</span>
        </label>
        {membresia && (
          <div>
            <label className="mb-1 block text-sm text-neutral-400">Precio de la membresía ($)</label>
            <input
              type="number"
              min={0}
              step={100}
              inputMode="numeric"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="Ej: 15000"
              className="w-full rounded border-2 border-neutral-800 bg-neutral-900 px-3 py-2 outline-none focus:border-yellow-400"
            />
          </div>
        )}
      </fieldset>

      {error && (
        <p className="rounded border-l-4 border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-yellow-400 py-3 text-lg font-bold text-black hover:bg-yellow-300 disabled:opacity-60"
      >
        {loading ? "Inscribiendo…" : "Generar inscripción →"}
      </button>
    </form>
  );
}
