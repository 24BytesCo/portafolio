"use server";

/**
 * Server Actions relacionadas con el formulario de contacto.
 *
 * Flujo:
 * 1) (Opcional) Valida captcha si está habilitado (Turnstile).
 * 2) Valida entrada con Zod (ContactActionSchema).
 * 3) Envía correo vía Resend usando la plantilla `Contact`.
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
import { Resend } from "resend";

import { Contact } from "@repo/emails";
import { ContactActionSchema } from "@repo/validators";

const EMAIL_FROM = env.EMAIL_FROM;
const EMAIL_TO = env.EMAIL_TO;

/**
 * Acción del servidor que procesa el formulario de contacto.
 *
 * @returns Objeto con `success` si el envío fue correcto.
 * @throws {ActionError} Si falla la validación del captcha o el envío por Resend.
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
  .action(async ({ parsedInput: { name, email, message } }) => {
    const resend = new Resend(env.RESEND_API_KEY);

    // pendiente: reemplazar el formulario por https://github.com/next-safe-action/adapter-react-hook-form
    if (!EMAIL_FROM || !EMAIL_TO) {
      throw new ActionError(
        "Configuración de correo incompleta (EMAIL_FROM/EMAIL_TO)",
      );
    }

    const { data: res, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      replyTo: email,
      subject: `Mensaje de ${name} desde el portafolio`,
      react: Contact({ name, email, message }),
    });

    if (res)
      return {
        success:
          "¡Gracias por escribir! Tu mensaje fue enviado correctamente.",
      };
    if (error) {
      // Exponer el mensaje real de Resend al cliente
      throw new ActionError(error.message ?? "Error al enviar el correo");
    }
  });
