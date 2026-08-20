"use server";

/**
 * Server Actions relacionadas con el formulario de contacto.
 *
 * Flujo:
 * 1) (Opcional) Valida captcha si está habilitado (Turnstile).
 * 2) Valida entrada con Zod (ContactActionSchema).
 * 3) Descarta en silencio si el honeypot ("company") viene relleno.
 * 4) Envía correo por la API de Resend usando la plantilla `Contact`.
 *
 * Requisitos de entorno:
 * - RESEND_API_KEY, EMAIL_FROM, EMAIL_TO
 * - CONTACT_CAPTCHA_PROVIDER ("turnstile" | "none")
 * - TURNSTILE_SECRET_KEY (si CONTACT_CAPTCHA_PROVIDER = "turnstile")
 */
import "server-only";

import { env } from "@/env";
import { actionClient, ActionError } from "@/lib/safe-action";
import { validateTurnstileToken } from "@/lib/turnstile";

import { enviarConResend, renderContactEmail } from "@repo/emails";
import { ContactActionSchema } from "@repo/validators";

const EMAIL_FROM = env.EMAIL_FROM;
const EMAIL_TO = env.EMAIL_TO;

const SUCCESS_MESSAGE =
  "¡Gracias por escribir! Tu mensaje fue enviado correctamente.";

/**
 * Acción del servidor que procesa el formulario de contacto.
 *
 * @returns Objeto con `success` si el envío fue correcto (o si se descartó
 *   por honeypot: se le miente al bot para no revelar la detección).
 * @throws {ActionError} Si falla la validación del captcha o el envío SMTP.
 */
export const contactSubmit = actionClient
  .use(async ({ next, clientInput }) => {
    const data = clientInput as {
      token?: string;
    };

    // Validar Turnstile solo si está habilitado en el entorno
    if (env.CONTACT_CAPTCHA_PROVIDER === "turnstile") {
      if (!data.token)
        throw new ActionError(
          "Validación de captcha fallida. Por favor completa el captcha.",
        );
      const res = await validateTurnstileToken(data.token);
      if (!res.success) {
        throw new ActionError(
          "Validación de captcha fallida. Por favor completa el captcha.",
        );
      }
    }

    return next();
  })
  .schema(ContactActionSchema)
  .action(async ({ parsedInput: { name, email, message, company } }) => {
    // Honeypot: un humano nunca rellena este campo (está oculto por CSS).
    // Se responde éxito falso para que el bot no aprenda a evitarlo.
    if (company) {
      return { success: SUCCESS_MESSAGE };
    }

    if (!EMAIL_FROM || !EMAIL_TO) {
      throw new ActionError(
        "Configuración de correo incompleta (EMAIL_FROM/EMAIL_TO)",
      );
    }
    if (!env.RESEND_API_KEY) {
      throw new ActionError("Configuración de Resend incompleta");
    }

    const { html, text } = await renderContactEmail({ name, email, message });

    const resultado = await enviarConResend(
      {
        from: EMAIL_FROM,
        to: EMAIL_TO,
        replyTo: email,
        subject: `Mensaje de ${name} desde el portafolio`,
        html,
        text,
      },
      env.RESEND_API_KEY,
    );

    if (!resultado.ok) {
      throw new ActionError(resultado.error ?? "Error al enviar el correo");
    }

    return { success: SUCCESS_MESSAGE };
  });
