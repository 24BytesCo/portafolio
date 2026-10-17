import type { ItemList, WithContext } from "schema-dts";
import { metadata as meta } from "@/app/config";
import Cursor from "@/components/cursor/cursor";
import { Footer, Header } from "@/components/sections";
import { servicios } from "@/components/sections/servicios/config";
import SmoothScroll from "@/components/smooth-scroll";
import { createMetadata } from "@/lib/metadata";

const title = "Servicios";
const description =
  "Qué puedo construir para ti: producto a medida de la idea a producción, automatización con IA sobre lo que ya tienes, y operación del software que ya está corriendo.";

export const metadata = createMetadata({
  title,
  description,
  openGraph: {
    url: "/servicios",
    title,
    description,
  },
  twitter: {
    title,
    description,
  },
});

const jsonLd: WithContext<ItemList> = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: title,
  description,
  url: `${meta.site.url}/servicios`,
  itemListElement: servicios.map((servicio, indice) => ({
    "@type": "ListItem",
    position: indice + 1,
    item: {
      "@type": "Service",
      name: servicio.titulo,
      description: servicio.resumen,
      areaServed: "CO",
      provider: {
        "@type": "Person",
        name: meta.author.name,
        url: meta.site.url,
      },
    },
  })),
};

export default function ServiciosLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SmoothScroll>
      <div className="flex min-h-[100dvh] flex-col">
        <Header />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <footer>
          <Footer />
        </footer>
      </div>
      <Cursor />
    </SmoothScroll>
  );
}
