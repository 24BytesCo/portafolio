import type { Contact } from "@/types/contact";
import {
  SiGithub,
  SiLinkedin,
  SiYoutube,
} from "@icons-pack/react-simple-icons";

const contact: Contact = {
  email: "alexis.dorado.munoz@gmail.com",
  socials: [
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/alexisdoradomunoz/",
      Icon: SiLinkedin,
    },
    {
      name: "Github",
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
