"use server";

/**
 * Server Actions relacionadas con el formulario de contacto.
 *
 * Flujo:
 * 1) (Opcional) Valida captcha si está habilitado (Turnstile).
 * 2) Valida entrada con Zod (ContactActionSchema).
 * 3) Descarta en silencio si el honeypot ("company") viene relleno.
 * 4) Envía correo por SMTP (Brevo) usando la plantilla `Contact`.
 *
 * Requisitos de entorno:
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, EMAIL_TO
 * - CONTACT_CAPTCHA_PROVIDER ("turnstile" | "none")
 * - TURNSTILE_SECRET_KEY (si CONTACT_CAPTCHA_PROVIDER = "turnstile")
 */

import "server-only";

import { env } from "@/env";
import { actionClient, ActionError } from "@/lib/safe-action";
import { validateTurnstileToken } from "@/lib/turnstile";
import { createTransport } from "nodemailer";

import { renderContactEmail } from "@repo/emails";
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
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
      throw new ActionError("Configuración SMTP incompleta");
    }

    const transporter = createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      // 465 = SMTPS implícito; el resto (587/25) negocia STARTTLS.
      secure: (env.SMTP_PORT ?? 587) === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });

    const { html, text } = await renderContactEmail({ name, email, message });

    try {
      await transporter.sendMail({
        from: EMAIL_FROM,
        to: EMAIL_TO,
        replyTo: email,
        subject: `Mensaje de ${name} desde el portafolio`,
        html,
        text,
      });
    } catch (e) {
      throw new ActionError(
        e instanceof Error ? e.message : "Error al enviar el correo",
      );
    }

    return { success: SUCCESS_MESSAGE };
  });
