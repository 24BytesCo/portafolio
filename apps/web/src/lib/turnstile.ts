"use server";

/**
 * Utilidad del lado del servidor para validar tokens de Cloudflare Turnstile.
 *
 * Detalles:
 * - Realiza `POST` a la API oficial de Turnstile para verificar el token.
 * - Requiere `TURNSTILE_SECRET_KEY` configurada en el entorno de servidor.
 * - Si la variable no está presente, responde con `success: false` para evitar
 *   falsos positivos en producción.
 */

import "server-only";

import { env } from "@/env";

interface CloudflareTurnstileResponse {
  success: boolean;
  "error-codes": string[];
  challenge_ts: string;
  hostname: string;
}

/**
 * Verifica un token de Cloudflare Turnstile contra la API oficial.
 *
 * @param token Token generado por el widget de Turnstile en el cliente.
 * @returns Respuesta de verificación con `success` y metadatos.
 */
export async function validateTurnstileToken(
  token: string,
): Promise<CloudflareTurnstileResponse> {
  if (!env.TURNSTILE_SECRET_KEY) {
    return {
      success: false,
      "error-codes": ["TURNSTILE_SECRET_KEY not set"],
      challenge_ts: "",
      hostname: "",
    };
  }

  const req = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: `secret=${encodeURIComponent(env.TURNSTILE_SECRET_KEY)}&response=${encodeURIComponent(token)}`,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    },
  );

  const res = (await req.json()) as CloudflareTurnstileResponse;
  return res;
}
