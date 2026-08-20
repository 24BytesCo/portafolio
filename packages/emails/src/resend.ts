export interface EnvioResend {
  to: string
  from: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

export interface ResultadoResend {
  ok: boolean
  /** id que devuelve Resend; sirve para confirmar en su dashboard que salió. */
  id?: string
  error?: string
}

const RESEND_URL = 'https://api.resend.com/emails'

/**
 * Envía un correo por la API HTTP de Resend.
 *
 * Reemplaza al SMTP de Brevo: Brevo exige IP autorizada (tanto en SMTP como en
 * su API) y el servidor corre en un Airbnb con IP dinámica — un reinicio de
 * router cortaba el correo EN SILENCIO (pasó el 2026-08-15, nadie se enteró
 * hasta revisar a mano). Resend no filtra por IP.
 *
 * `fetchImpl` es inyectable para poder probar esta función sin red real; en
 * producción usa el `fetch` global de Node.
 *
 * No lanza: el llamador decide qué hacer con el resultado. `actions.ts` lo
 * convierte en un `ActionError` para que el usuario del formulario se entere,
 * pero la función en sí nunca revienta el proceso.
 */
export async function enviarConResend(
  correo: EnvioResend,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ResultadoResend> {
  try {
    const res = await fetchImpl(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: correo.from,
        to: correo.to,
        subject: correo.subject,
        html: correo.html,
        text: correo.text,
        reply_to: correo.replyTo,
      }),
    })
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string }
    if (!res.ok) {
      return { ok: false, error: data.message ?? `HTTP ${res.status}` }
    }
    return { ok: true, id: data.id }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
