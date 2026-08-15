import { render } from '@react-email/render'

import Contact from './templates/contact'

interface ContactEmailInput {
  name: string
  email: string
  message: string
}

/**
 * Renderiza la plantilla de contacto a HTML + texto plano, listos para
 * mandar por SMTP con nodemailer (nodemailer no sabe renderizar JSX; eso
 * antes lo hacía Resend internamente al recibir `react:`).
 */
export async function renderContactEmail(input: ContactEmailInput) {
  const element = Contact(input)
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ])
  return { html, text }
}
