import { leerCifrasCanal } from "@/lib/cifras-canal";

import { CifrasCanalVista } from "./cifras-canal-vista";

/** `<CifrasCanal />` en un MDX: lee la fábrica en el servidor y deja que el
    cliente las refresque. Sin la API configurada salen las de respaldo. */
export async function CifrasCanal() {
  const cifras = await leerCifrasCanal();
  return <CifrasCanalVista inicial={cifras} />;
}
