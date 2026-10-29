import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getProjectBySlug, getAdjacentProject, projects } from "@/lib/projects";
import { ProjectDetail } from "@/components/sections/ProjectDetail";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    projects.map((project) => ({ locale, slug: project.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {};
  }

  const typedLocale = locale as "pt" | "en";

  return {
    title: `${project.title[typedLocale]} — Caio Pacheco`,
    description: project.tagline[typedLocale],
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const nextProject = getAdjacentProject(slug);
  const t = await getTranslations("project");

  return (
    <ProjectDetail
      project={project}
      nextProject={nextProject}
      labels={{
        summary: t("summary"),
        problem: t("problem"),
        objectives: t("objectives"),
        solution: t("solution"),
        process: t("process"),
        gallery: t("gallery"),
        results: t("results"),
        technologies: t("technologies"),
        disciplines: t("disciplines"),
        nextProject: t("nextProject"),
        visitSite: t("visitSite"),
        backToProjects: t("backToProjects"),
        teamNote: project.credit ? t("team.note", { studio: project.credit.studio }) : "",
        teamLink: project.credit ? t("team.link", { studio: project.credit.studio }) : "",
      }}
    />
  );
}
