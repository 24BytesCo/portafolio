interface Servicio {
  titulo: string;
  resumen: string;
  paraQuien: string;
  entregables: string[];
  plazo: string;
  pruebas: { texto: string; href: string }[];
}

// Tres paquetes por alcance, sin precio: la cifra se habla en la primera
// llamada, cuando ya se sabe qué hay que construir.
const servicios: Servicio[] = [
  {
    titulo: "Producto a medida, de la idea a producción",
    resumen:
      "Construyo el producto completo y lo dejo corriendo con su dominio, su despliegue y su cobro. No entrego un repositorio: entrego algo que funciona y que tu gente puede operar.",
    paraQuien:
      "Para quien tiene una idea validada o un proceso que ya le da dinero y necesita convertirlo en software propio.",
    entregables: [
      "Alcance cerrado por escrito antes de escribir código",
      "Backend, frontend y base de datos, con pruebas donde importa",
      "Infraestructura en contenedores, dominio y certificados, sin puertos expuestos a internet",
      "Cobro con pasarelas colombianas y notificaciones por correo o WhatsApp, si el producto lo necesita",
      "SEO técnico con renderizado en servidor y datos estructurados",
      "Documentación de decisiones y traspaso a tu equipo",
    ],
    plazo: "Entre 6 y 12 semanas según alcance, con entregas por hitos.",
    pruebas: [
      { texto: "SECOP Monitor", href: "/projects/secop-monitor" },
      { texto: "Legado Público", href: "/projects/legado-publico" },
    ],
  },
  {
    titulo: "Automatización con IA sobre lo que ya tienes",
    resumen:
      "Proceso repetitivo que hoy hace una persona a mano, resuelto con modelos de lenguaje y con las reglas críticas en código, no en el prompt. Cada respuesta se valida y se audita.",
    paraQuien:
      "Para equipos que ya tienen datos o contenido y pierden horas cada semana en trabajo mecánico.",
    entregables: [
      "Revisión del proceso actual y qué parte conviene automatizar primero",
      "Prototipo medible sobre tus datos reales antes de comprometer el desarrollo",
      "Validación de cada respuesta del modelo contra la fuente, con citas verificables",
      "Control de costos por llamada y registro de cada petición para auditarla",
      "Puesta en producción con alertas cuando algo se salga de lo esperado",
    ],
    plazo: "Entre 3 y 6 semanas hasta la primera versión en producción.",
    pruebas: [
      { texto: "BetLab", href: "/projects/betlab-model" },
      { texto: "Fábrica de videos", href: "/projects/fabrica-de-videos" },
    ],
  },
  {
    titulo: "Operación del software que ya está corriendo",
    resumen:
      "Si ya tienes el producto y lo que falta es que no se caiga: despliegues, respaldos, monitoreo y las mejoras de cada mes, con alguien que responde cuando algo falla.",
    paraQuien:
      "Para quien heredó un sistema, perdió al desarrollador que lo hizo, o no quiere un equipo interno de infraestructura.",
    entregables: [
      "Despliegues automatizados y reversibles",
      "Respaldos cifrados, probados de verdad restaurándolos",
      "Monitoreo con alertas por correo cuando un servicio deja de responder",
      "Actualizaciones de seguridad y parches de dependencias",
      "Un informe mensual de qué pasó y qué conviene hacer después",
    ],
    plazo: "Contrato mensual, con un mes de prueba y salida sin penalidad.",
    pruebas: [
      { texto: "24Bytes Herramientas", href: "/projects/images-to-pdf" },
    ],
  },
];

export { servicios };
export type { Servicio };
