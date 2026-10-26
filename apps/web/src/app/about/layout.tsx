import type { ProfilePage } from "schema-dts";
import { metadata as meta } from "@/app/config";
import Cursor from "@/components/cursor/cursor";
import { Footer, Header } from "@/components/sections";
import SmoothScroll from "@/components/smooth-scroll";
import { grafo, referenciaPersona } from "@/lib/entidad";
import { createMetadata } from "@/lib/metadata";

const title = "Sobre mí";
const description = "Conoce más sobre mí y cómo trabajo";

export const metadata = createMetadata({
  title,
  description,
  openGraph: {
    url: "/about",
    type: "profile",
    title,
    description,
  },
  twitter: {
    title,
    description,
  },
});

// ProfilePage y no AboutPage: esta es la página de la persona, y es la que
// resuelve el `@id` al que apuntan todas las demás.
const perfil: ProfilePage = {
  "@type": "ProfilePage",
  "@id": `${meta.site.url}/about#pagina`,
  name: title,
  description,
  url: `${meta.site.url}/about`,
  inLanguage: "es",
  mainEntity: referenciaPersona,
};

const jsonLd = grafo(perfil);

export default function AboutLayout({
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
