// Cliente del backend de inscripciones (Express + PostgreSQL/Neon).
// La URL se configura con NEXT_PUBLIC_API_URL (ver .env.local).
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const CATEGORIAS = ["Iniciantes", "Intermedios", "Adultos", "Avanzados"] as const;
export const DIAS = ["Lunes", "Miércoles", "Jueves"] as const;
export const MAX_POR_CATEGORIA = 10;

export type Categoria = (typeof CATEGORIAS)[number];
export type Dia = (typeof DIAS)[number];

export interface CupoInfo {
  used: number;
  remaining: number;
  max: number;
}
export type Cupos = Record<string, CupoInfo>;

export interface NuevaInscripcion {
  name: string;
  phone: string;
  category: Categoria;
  day: Dia;
}

export async function getCupos(): Promise<Cupos> {
  const res = await fetch(`${API}/api/cupos`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudieron cargar los cupos");
  return res.json();
}

export async function crearInscripcion(data: NuevaInscripcion): Promise<{ id: string }> {
  const res = await fetch(`${API}/api/inscripciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "No se pudo guardar la inscripción");
  return json;
}

export async function crearMembresia(inscripcionId: string, precio: number) {
  const res = await fetch(`${API}/api/memberships`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inscripcion_id: inscripcionId, precio }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "No se pudo guardar la membresía");
  return json;
}

export function whatsappLink(msg: string): string {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const base = num ? `https://wa.me/${num}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(msg)}`;
}
