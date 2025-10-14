"use client";

/**
 * Formulario de contacto del sitio.
 *
 * - Valida con Zod y react-hook-form.
 * - Si el formulario está habilitado, solicita verificación Turnstile y envía vía Server Actions.
 * - Si no está habilitado, abre un enlace mailto como alternativa.
 */

import { useState } from "react";
import { contactSubmit } from "@/app/actions";
import { FormError } from "@/components/sections/contact/_components/form-error";
import { FormSuccess } from "@/components/sections/contact/_components/form-success";
import { TurnstileModal } from "@/components/sections/contact/_components/turnstile-modal";
import { contact } from "@/components/sections/contact/config";
import { env } from "@/env";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { ContactForm as ContactFormType } from "@repo/validators";
import { Button } from "@repo/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";
import { Icons } from "@repo/ui/icons";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { ContactFormSchema } from "@repo/validators";

export default function ContactForm() {
  const form = useForm<ContactFormType>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const { execute, result, status } = useAction(contactSubmit);
  const [isOpen, setIsOpen] = useState(false);

  // pendiente: refactorizar manejo de `isOpen` para un flujo más claro
  // valores: ContactFormType
  function onSubmit(values: ContactFormType) {
    if (env.NEXT_PUBLIC_CONTACT_FORM_ENABLED === "true") {
      setIsOpen(true);
    } else {
      const mailto =
        `mailto:${encodeURIComponent(contact.email)}` +
        `?subject=${encodeURIComponent("Contacto desde el portafolio")}` +
        `&body=${encodeURIComponent(
          `Nombre: ${values.name}\nMensaje: ${values.message}`,
        )}`;
      window.open(mailto);
    }
  }

  /**
   * Callback invocado tras resolver el captcha de Turnstile.
   *
   * @param token Token devuelto por Turnstile; si es inválido, se muestra un error.
   */
  function onVerify(token?: string) {
    setIsOpen(false);
    if (!token) {
      toast.error(
        "Validación de captcha fallida. Por favor completa el captcha.",
        {
          position: "bottom-center",
        },
      );
      return;
    }
    execute({ ...form.getValues(), token });
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre y apellido"
                    disabled={status === "executing"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="correo@ejemplo.com"
                    disabled={status === "executing"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensaje</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={status === "executing"}
                    placeholder={"¡Hola!\n\nSoy [tu nombre]. Me gustaría ponerme en contacto para ..."}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormError message={result.serverError} />
          <FormSuccess message={result.data?.success} />

          <Button
            disabled={status === "executing"}
            type="submit"
            className={"w-full"}
          >
            {status === "executing" && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Enviar
          </Button>
        </form>
      </Form>
      <TurnstileModal open={isOpen} callback={onVerify} />
    </div>
  );
}
