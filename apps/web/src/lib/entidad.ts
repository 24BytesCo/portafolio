import type { Organization, Person, Thing, WithContext } from "schema-dts";
import { metadata as meta } from "@/app/config";
import { contact } from "@/components/sections/contact/config";

/**
 * Una sola entidad para todo el sitio.
 *
 * Hasta el 2026-10-22 cada página declaraba su propio `Person` suelto, sin
 * identificador: tres copias que un buscador no puede casar entre sí. Con un
 * `@id` estable (el de `/about`, que es la página de la persona) todas las
 * páginas hablan del mismo sujeto, que es lo que hace falta para ganar la
 * búsqueda por el nombre propio.
 */
const ID_PERSONA = `${meta.site.url}/about#persona`;
const ID_ORGANIZACION = `${meta.site.url}/#organizacion`;

const persona: Person = {
  "@type": "Person",
  "@id": ID_PERSONA,
  name: meta.author.name,
  alternateName: "Alexis Dorado",
  givenName: "Alexis",
  familyName: "Dorado Muñoz",
  url: `${meta.site.url}/about`,
  mainEntityOfPage: `${meta.site.url}/about`,
  image: `${meta.site.url}/images/autor-alexis.jpg`,
  jobTitle: meta.author.label,
  description: meta.site.description,
  email: `mailto:${contact.email}`,
  worksFor: { "@id": ID_ORGANIZACION },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bogotá",
    addressCountry: "CO",
  },
  knowsAbout: [
    "Desarrollo de software a medida",
    "NestJS",
    "Angular",
    "Python",
    "Inteligencia artificial aplicada",
    "Docker",
    "PostgreSQL",
  ],
  sameAs: contact.socials.map((social) => social.href),
};

const organizacion: Organization = {
  "@type": "Organization",
  "@id": ID_ORGANIZACION,
  name: "24Bytes",
  url: meta.site.url,
  logo: `${meta.site.url}/favicon/android-chrome-512x512.png`,
  description: meta.site.description,
  founder: { "@id": ID_PERSONA },
  email: `mailto:${contact.email}`,
  sameAs: contact.socials.map((social) => social.href),
};

const referenciaPersona = { "@id": ID_PERSONA } as const;
const referenciaOrganizacion = { "@id": ID_ORGANIZACION } as const;

/**
 * Grafo de la página: lo propio de la página primero y, detrás, la persona y
 * la organización completas, para que las referencias por `@id` resuelvan sin
 * depender de que el buscador haya leído antes otra página.
 */
function grafo(...propio: Thing[]): WithContext<Thing> {
  return {
    "@context": "https://schema.org",
    "@graph": [...propio, persona, organizacion],
  } as unknown as WithContext<Thing>;
}

export {
  ID_ORGANIZACION,
  ID_PERSONA,
  grafo,
  organizacion,
  persona,
  referenciaOrganizacion,
  referenciaPersona,
};
