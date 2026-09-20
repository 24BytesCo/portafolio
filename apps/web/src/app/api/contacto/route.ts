/**
 * Formulario de contacto para los sitios estáticos de 24Bytes (hoy:
 * pdf.24bytes.pro, en GitHub Pages, sin backend propio). Reemplaza a
 * FormSubmit: el mensaje ya no pasa por un tercero y sale por el mismo Resend
 * que el formulario del portafolio.
 *
 * Defensas, en orden: origen en lista cerrada (CORS + rechazo 403), honeypot,
 * validación con Zod y tope de envíos por IP. El tope vive en memoria: se
 * reinicia con el contenedor, que para frenar a un bot insistente alcanza.
 */
import { NextResponse } from "next/server";
import { env } from "@/env";
import { z } from "zod";

import { enviarConResend, renderContactEmail } from "@repo/emails";

const ORIGENES: Record<string, string> = {
  "https://pdf.24bytes.pro": "24Bytes PDF",
};

const MAXIMO_POR_HORA = 5;
const HORA_MS = 60 * 60 * 1000;
const enviosPorIp = new Map<string, number[]>();

const Esquema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email().max(120),
  message: z.string().trim().min(4).max(1500),
  // Honeypot: oculto para personas; si llega relleno se descarta en silencio.
  company: z.string().optional(),
});

function cabecerasCors(origen: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origen,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function superaTope(ip: string): boolean {
  const ahora = Date.now();
  const recientes = (enviosPorIp.get(ip) ?? []).filter(
    (t) => ahora - t < HORA_MS,
  );
  if (recientes.length >= MAXIMO_POR_HORA) {
    enviosPorIp.set(ip, recientes);
    return true;
  }
  recientes.push(ahora);
  enviosPorIp.set(ip, recientes);
  return false;
}

export function OPTIONS(req: Request) {
  const origen = req.headers.get("origin") ?? "";
  if (!(origen in ORIGENES)) return new NextResponse(null, { status: 403 });
  return new NextResponse(null, {
    status: 204,
    headers: cabecerasCors(origen),
  });
}

export async function POST(req: Request) {
  const origen = req.headers.get("origin") ?? "";
  const sitio = ORIGENES[origen];
  if (!sitio) return NextResponse.json({ ok: false }, { status: 403 });
  const headers = cabecerasCors(origen);

  const datos = Esquema.safeParse(await req.json().catch(() => null));
  if (!datos.success) {
    return NextResponse.json(
      { ok: false, error: "datos" },
      { status: 400, headers },
    );
  }
  const { name, email, message, company } = datos.data;
  // Al bot se le responde éxito para que no aprenda a esquivar el honeypot.
  if (company) return NextResponse.json({ ok: true }, { headers });

  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "desconocida";
  if (superaTope(ip)) {
    return NextResponse.json(
      { ok: false, error: "tope" },
      { status: 429, headers },
    );
  }

  if (!env.EMAIL_FROM || !env.EMAIL_TO || !env.RESEND_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "config" },
      { status: 503, headers },
    );
  }

  const { html, text } = await renderContactEmail({ name, email, message });
  const resultado = await enviarConResend(
    {
      from: env.EMAIL_FROM,
      to: env.EMAIL_TO,
      replyTo: email,
      subject: `[${sitio}] Mensaje de ${name}`,
      html,
      text,
    },
    env.RESEND_API_KEY,
  );
  if (!resultado.ok) {
    console.error("contacto externo: Resend falló:", resultado.error);
    return NextResponse.json(
      { ok: false, error: "envio" },
      { status: 502, headers },
    );
  }
  return NextResponse.json({ ok: true }, { headers });
}
