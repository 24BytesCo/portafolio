import type { Contact } from "@/types/contact";
import {
  SiGithub,
  SiLinkedin,
  SiYoutube,
} from "@icons-pack/react-simple-icons";

const contact: Contact = {
  // Correo del dominio: el Gmail personal restaba credibilidad en un sitio que
  // se presenta como estudio. Necesita la regla de reenvío en Cloudflare.
  email: "Alexis.Dorado@24bytes.pro",
  socials: [
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/alexisdoradomunoz/",
      Icon: SiLinkedin,
    },
    {
      name: "GitHub",
      href: "https://github.com/24BytesCo",
      Icon: SiGithub,
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@24bytes",
      Icon: SiYoutube,
    },
  ],
};

export { contact };
