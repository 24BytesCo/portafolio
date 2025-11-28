"use client";

/**
 * Sección de contacto que agrupa información de correo/redes y el formulario.
 */

import React from "react";
import Link from "@/components/fancy/link";
import TextReveal from "@/components/fancy/text-reveal";
import MotionWrap from "@/components/motion-wrap";
import { contact } from "@/components/sections/contact/config";

import { cn } from "@repo/ui";
import { buttonVariants } from "@repo/ui/button";

import ContactForm from "./contact-form";
import { trackEvent } from "@/lib/analytics";

function Contact() {
  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="contact">
      <div className="px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-24">
        <div className="py-3">
          <TextReveal as="h2" className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Contáctame</TextReveal>
          <TextReveal as="p" className="text-muted-foreground max-w-[600px]">
            ¿Tienes una consulta o quieres trabajar conmigo? Envíame un mensaje con el formulario.
          </TextReveal>
        </div>
        <div className="flex flex-wrap">
          <div className="flex w-full flex-col gap-4 py-3 lg:order-2 lg:w-1/4 lg:pl-3">
            <div>
              <p className="text-muted-foreground text-sm">Correo</p>
              {/* pendiente: separar en componente con texto animado y usar una etiqueta <a> */}
              <Link
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "text-md h-min w-min p-0 font-normal",
                )}
                href={`mailto:${contact.email}`}
                onClick={() => trackEvent("contact_click_email")}
              >
                {contact.email}
              </Link>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Redes</p>
              <div className="flex flex-col gap-1">
                {contact.socials.map(({ Icon, name, href }, index) => (
                  <Link
                    target="_blank"
                    href={href}
                    className={cn(
                      buttonVariants({ variant: "link" }),
                      "text-md h-min w-min gap-1 !p-0",
                    )}
                    key={`contact-social_${index}`}
                    onClick={() =>
                      trackEvent("social_click", { name, href })
                    }
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col gap-4 py-3 lg:w-3/4 lg:pr-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </MotionWrap>
  );
}

export default Contact;
