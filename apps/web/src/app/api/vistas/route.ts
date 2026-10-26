import { NextResponse } from "next/server";
import { vistasDe } from "@/lib/vistas";

/**
 * Vistas de una ruta. Existe porque las páginas son estáticas: el HTML se
 * genera en el despliegue, cuando el contenedor de build todavía no alcanza a
 * Umami, así que el número tiene que llegar después, ya en marcha.
 *
 * La consulta a Umami se cachea media hora dentro de `vistasDe`, así que esto
 * no añade una petición a la analítica por visitante.
 */
export const dynamic = "force-dynamic";

export async function GET(peticion: Request): Promise<NextResponse> {
  const ruta = new URL(peticion.url).searchParams.get("ruta");

  // Solo rutas internas: nada de pedir el recuento de un dominio ajeno.
  if (!ruta?.startsWith("/")) {
    return NextResponse.json({ vistas: null }, { status: 400 });
  }

  const vistas = await vistasDe(ruta);

  return NextResponse.json(
    { vistas },
    { headers: { "cache-control": "public, max-age=300" } },
  );
}
