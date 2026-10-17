import { NextResponse } from "next/server";
import { leerCifrasCanal } from "@/lib/cifras-canal";

/** Cifras del canal para el artículo del blog. Nunca falla: hay respaldo. */
export async function GET() {
  const cifras = await leerCifrasCanal();
  return NextResponse.json(cifras, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=1800" },
  });
}
