import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en"],
  defaultLocale: "pt",
  pathnames: {
    "/": "/",
    "/projetos": {
      pt: "/projetos",
      en: "/projects",
    },
    "/projetos/[slug]": {
      pt: "/projetos/[slug]",
      en: "/projects/[slug]",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
