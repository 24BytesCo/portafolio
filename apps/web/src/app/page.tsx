import type { WebSite } from "schema-dts";
import { metadata as meta } from "@/app/config";
import Cursor from "@/components/cursor/cursor";
import {
  About,
  Blog,
  Contact,
  Experience,
  Footer,
  Header,
  Hero,
  Projects,
  Skills,
} from "@/components/sections";
import SmoothScroll from "@/components/smooth-scroll";
import { grafo, referenciaPersona } from "@/lib/entidad";

const sitio: WebSite = {
  "@type": "WebSite",
  "@id": `${meta.site.url}/#sitio`,
  name: meta.site.title,
  url: meta.site.url,
  inLanguage: "es",
  author: referenciaPersona,
  publisher: referenciaPersona,
};

const jsonLd = grafo(sitio);

export default function Home() {
  return (
    <SmoothScroll>
      <div className="flex min-h-[100dvh] flex-col">
        <Header />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <main className="flex-1">
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Experience />
          <Blog />
          <Contact />
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
      <Cursor />
    </SmoothScroll>
  );
}
