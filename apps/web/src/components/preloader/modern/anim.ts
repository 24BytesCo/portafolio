export const opacity = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 0.75,
    transition: { duration: 1, delay: 0.2 },
  },
};

// `top` fuerza layout (reflow) en cada frame: en un overlay a pantalla
// completa eso es la causa de un CLS altísimo en el sitio real (~0.83 en
// móvil, medido con Lighthouse contra producción; en local sin throttling
// casi no se notaba). `y` anima vía `transform`, que es solo compositor y no
// dispara layout shift. Mismo efecto visual, sin el costo.
export const slideUp = {
  initial: {
    y: 0,
  },
  exit: {
    y: "-100dvh",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
  },
};
