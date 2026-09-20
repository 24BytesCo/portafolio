import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

interface ContactEmailProps {
  name: string;
  email: string;
  message: string;
  /** Sitio desde el que se escribió; por defecto, el portafolio. */
  sitio?: string;
}

const ContactEmail = ({
  name,
  email,
  message,
  sitio = "24bytes.pro",
}: ContactEmailProps) => {
  const previewText = `Mensaje de ${name} desde ${sitio}`;

  return (
    <Html lang="es">
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[24px]">
              <Text className="m-0 text-center text-[18px] font-bold tracking-tight text-black">
                24Bytes
              </Text>
            </Section>
            <Heading className="mx-0 my-[24px] p-0 text-center text-[22px] font-normal text-black">
              Mensaje de <strong>{name}</strong> desde <strong>{sitio}</strong>
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              <strong>{name}</strong> (
              <Link
                href={`mailto:${email}`}
                className="text-blue-600 no-underline"
              >
                {email}
              </Link>
              ) escribió desde el formulario de <strong>{sitio}</strong>:
            </Text>
            <Text className="rounded bg-[#f6f7f9] p-[14px] text-[14px] leading-[22px] whitespace-pre-wrap text-black">
              {message}
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[20px] text-[#666666]">
              Responde a este correo y la respuesta le llega directamente a{" "}
              {name}.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ContactEmail.PreviewProps = {
  name: "Jane Doe",
  email: "jane@example.com",
  message: `Hola:

  Necesito una herramienta para firmar PDF. ¿La tienen pensada?
  `,
  sitio: "24Bytes PDF",
} as ContactEmailProps;

export default ContactEmail;
