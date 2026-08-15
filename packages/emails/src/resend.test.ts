// Prueba del camino nuevo de envío (migración Brevo SMTP -> Resend HTTP,
// 2026-08-15). Portafolio no tenía runner de tests antes de este cambio; se
// usa el `node:test` incorporado vía `tsx` (ya presente en el repo, hoisted
// por otra herramienta) para no sumar dependencias nuevas solo por esto.
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { enviarConResend } from './resend'

const correoBase = {
  to: 'destino@x.com',
  from: 'no-responder@24bytes.pro',
  subject: 'hola',
  html: '<p>hi</p>',
  text: 'hi',
}

test('llama a la API de Resend con Authorization Bearer y el cuerpo esperado', async () => {
  const llamadas: { url: string; init: RequestInit }[] = []
  const fetchFalso = (async (url: string, init: RequestInit) => {
    llamadas.push({ url, init })
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: 'abc-123' }),
    } as Response
  }) as typeof fetch

  const r = await enviarConResend(correoBase, 're_test_123', fetchFalso)

  assert.deepEqual(r, { ok: true, id: 'abc-123' })
  assert.equal(llamadas.length, 1)
  const [llamada] = llamadas
  assert.ok(llamada)
  assert.equal(llamada.url, 'https://api.resend.com/emails')
  assert.equal((llamada.init.headers as Record<string, string>).Authorization, 'Bearer re_test_123')
  const body = JSON.parse(llamada.init.body as string)
  // `JSON.stringify` omite las claves en `undefined` (reply_to, cuando no hay
  // replyTo), así que no aparece en el objeto parseado.
  assert.deepEqual(body, {
    from: correoBase.from,
    to: correoBase.to,
    subject: correoBase.subject,
    html: correoBase.html,
    text: correoBase.text,
  })
})

test('si Resend responde con error HTTP, devuelve ok:false con el motivo (no lanza)', async () => {
  const fetchFalso = (async () =>
    ({
      ok: false,
      status: 403,
      json: async () => ({ message: 'domain is not verified' }),
    }) as Response) as typeof fetch

  const r = await enviarConResend(correoBase, 're_test_123', fetchFalso)

  assert.deepEqual(r, { ok: false, error: 'domain is not verified' })
})

test('si la red falla (fetch rechaza), devuelve ok:false en vez de lanzar', async () => {
  const fetchFalso = (async () => {
    throw new Error('fetch failed')
  }) as unknown as typeof fetch

  const r = await enviarConResend(correoBase, 're_test_123', fetchFalso)

  assert.deepEqual(r, { ok: false, error: 'fetch failed' })
})

test('propaga replyTo como reply_to', async () => {
  let cuerpoEnviado: Record<string, unknown> = {}
  const fetchFalso = (async (_url: string, init: RequestInit) => {
    cuerpoEnviado = JSON.parse(init.body as string)
    return { ok: true, status: 200, json: async () => ({ id: 'z' }) } as Response
  }) as typeof fetch

  await enviarConResend({ ...correoBase, replyTo: 'quien-escribe@x.com' }, 're_test_123', fetchFalso)

  assert.equal(cuerpoEnviado.reply_to, 'quien-escribe@x.com')
})
