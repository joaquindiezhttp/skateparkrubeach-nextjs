"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CATEGORIAS,
  DIAS,
  MAX_POR_CATEGORIA,
  getInscripciones,
  setPresente,
  eliminarInscripcion,
  type Inscripto,
} from "@/lib/api";

export default function AdminPanel() {
  const [items, setItems] = useState<Inscripto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fDia, setFDia] = useState("");
  const [fCat, setFCat] = useState("");

  async function load() {
    setError("");
    try {
      setItems(await getInscripciones());
    } catch {
      setError("No se pudo conectar con el backend. ¿Está corriendo?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totales = useMemo(() => {
    const t: Record<string, number> = {};
    CATEGORIAS.forEach((c) => (t[c] = 0));
    items.forEach((i) => {
      if (t[i.category] != null) t[i.category]++;
    });
    return t;
  }, [items]);

  const filtrados = useMemo(
    () =>
      items
        .filter((i) => (!fDia || i.day === fDia) && (!fCat || i.category === fCat))
        .sort((a, b) => a.category.localeCompare(b.category) || a.day.localeCompare(b.day)),
    [items, fDia, fCat]
  );

  async function toggleAsistencia(i: Inscripto) {
    try {
      await setPresente(i.id, !i.present);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  }

  async function borrar(i: Inscripto) {
    if (!confirm(`¿Eliminar a ${i.name}?`)) return;
    try {
      await eliminarInscripcion(i.id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  }

  function exportarCSV() {
    if (!items.length) return alert("No hay inscriptos para exportar.");
    const head = ["Nombre", "Teléfono", "Categoría", "Día", "Membresía", "Asistencia", "Inscripción"];
    const cell = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [head.join(",")].concat(
      items.map((r) =>
        [
          r.name,
          r.phone,
          r.category,
          r.day,
          r.membresia ? r.precio : "No",
          r.present ? "Presente" : "Pendiente",
          new Date(r.createdAt).toLocaleString("es-AR"),
        ]
          .map(cell)
          .join(",")
      )
    );
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inscriptos-skatepark-perubeach-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section>
      {/* Totales por categoría */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CATEGORIAS.map((c) => {
          const used = totales[c] ?? 0;
          const full = used >= MAX_POR_CATEGORIA;
          return (
            <div
              key={c}
              className={`rounded border-2 bg-neutral-900 p-3 ${
                full ? "border-red-500" : "border-neutral-800"
              }`}
            >
              <div className="text-xs uppercase tracking-wide text-neutral-400">{c}</div>
              <div className="text-2xl font-bold">
                {used}
                <span className="text-base text-neutral-500">/{MAX_POR_CATEGORIA}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Día
          <select
            value={fDia}
            onChange={(e) => setFDia(e.target.value)}
            className="rounded border-2 border-neutral-800 bg-neutral-900 px-2 py-1.5 text-sm text-white"
          >
            <option value="">Todos</option>
            {DIAS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Categoría
          <select
            value={fCat}
            onChange={(e) => setFCat(e.target.value)}
            className="rounded border-2 border-neutral-800 bg-neutral-900 px-2 py-1.5 text-sm text-white"
          >
            <option value="">Todas</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={exportarCSV}
          className="ml-auto rounded border-2 border-yellow-400 px-3 py-1.5 text-sm font-semibold text-yellow-400 hover:bg-yellow-400 hover:text-black"
        >
          Exportar CSV
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <p className="py-10 text-center text-neutral-500">Cargando…</p>
      ) : error ? (
        <p className="rounded border-l-4 border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : filtrados.length === 0 ? (
        <p className="py-10 text-center text-neutral-500">No hay inscriptos.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-neutral-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-neutral-900 text-xs uppercase tracking-wide text-yellow-400">
              <tr>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Teléfono</th>
                <th className="px-3 py-2">Categoría</th>
                <th className="px-3 py-2">Día</th>
                <th className="px-3 py-2">Membresía</th>
                <th className="px-3 py-2">Asistencia</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((i) => (
                <tr
                  key={i.id}
                  className={`border-t border-neutral-800 ${i.present ? "bg-yellow-400/5" : ""}`}
                >
                  <td className="px-3 py-2 font-medium">{i.name}</td>
                  <td className="px-3 py-2">
                    <a href={`tel:${i.phone}`} className="text-neutral-300 hover:text-yellow-400">
                      {i.phone}
                    </a>
                  </td>
                  <td className="px-3 py-2">{i.category}</td>
                  <td className="px-3 py-2">{i.day}</td>
                  <td className="px-3 py-2">
                    {i.membresia ? `$${Number(i.precio).toLocaleString("es-AR")}` : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleAsistencia(i)}
                      className={`rounded border-2 px-2 py-1 text-xs font-semibold ${
                        i.present
                          ? "border-yellow-400 bg-yellow-400 text-black"
                          : "border-neutral-700 text-white hover:border-neutral-500"
                      }`}
                    >
                      {i.present ? "Presente ✓" : "Marcar"}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => borrar(i)}
                      aria-label="Eliminar"
                      className="rounded border-2 border-neutral-700 px-2 py-1 text-xs text-red-400 hover:border-red-500"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
