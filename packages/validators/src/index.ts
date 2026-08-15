import { z } from "zod";

export const ContactFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  email: z
    .string({
      required_error: "Please enter a valid email.",
    })
    .email(),
  message: z.string().max(380).min(4, {
    message: "Message must be at least 4 characters.",
  }),
  // Honeypot anti-spam: campo oculto para personas (invisible por CSS), que
  // los bots de formularios rellenan igual porque leen el HTML crudo. Se
  // acepta cualquier valor aquí; si llega con contenido, el envío se descarta
  // en silencio en app/actions.ts (sin decirle al bot que fue detectado).
  company: z.string().optional(),
});

export type ContactForm = z.infer<typeof ContactFormSchema>;

export const ContactActionSchema = ContactFormSchema.extend({
  // Solo obligatorio cuando el captcha de Turnstile está habilitado; la
  // acción del servidor lo exige en ese caso (ver app/actions.ts). Si aquí
  // fuera obligatorio siempre, el envío sin captcha fallaría la validación
  // del schema en silencio (no dispara `serverError`, así que en la UI no
  // pasaba nada al enviar).
  token: z.string().optional(),
});

export type ContactAction = z.infer<typeof ContactActionSchema>;
