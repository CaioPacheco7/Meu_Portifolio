import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { projects } from "@/lib/projects";

const BASE_URL = "https://caiopacheco.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["/", "/projetos"] as const;

  const staticEntries = staticPaths.flatMap((pathname) =>
    routing.locales.map((locale) => ({
      url: `${BASE_URL}${getPathname({ locale, href: pathname })}`,
      lastModified: new Date(),
    })),
  );

  const projectEntries = projects.flatMap((project) =>
    routing.locales.map((locale) => ({
      url: `${BASE_URL}${getPathname({
        locale,
        href: { pathname: "/projetos/[slug]", params: { slug: project.slug } },
      })}`,
      lastModified: new Date(),
    })),
  );

  return [...staticEntries, ...projectEntries];
}
