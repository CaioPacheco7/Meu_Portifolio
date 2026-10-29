import type { ProjectCategory } from "@/types/project";

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "sites",
  "landing-pages",
  "ecommerce",
  "dashboard",
  "aplicativos",
];

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/caio_pacheco7/",
  linkedin: "https://www.linkedin.com/in/caio-pacheco-prates-753534441/",
  github: "https://github.com/CaioPacheco7",
  email: "mailto:caioppacheco7@gmail.com",
  // +55 77 99133-2426
  whatsapp: "https://wa.me/5577991332426",
};

/** The WhatsApp chat, opened with `message` already typed in. */
export const whatsappLink = (message: string) =>
  `${SOCIAL_LINKS.whatsapp}?text=${encodeURIComponent(message)}`;

export const FORJA_STUDIO_URL = "https://instagram.com/forja.studio.oficial";
export const FORJA_STUDIO_NAME = "Forja Studio";

/** Where the "built at Forja" credit sends people: the studio's own site and portfolio. */
export const FORJA_PORTFOLIO_URL = "https://theforjastudio.com.br/";

export const NAV_LINKS = [
  { key: "projects", href: "/#projetos" },
  { key: "about", href: "/#sobre" },
  { key: "process", href: "/#processo" },
  { key: "contact", href: "/#contato" },
] as const;
