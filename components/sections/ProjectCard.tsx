"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ImageZoom } from "@/components/ui/ImageZoom";
import type { Project } from "@/types/project";

export function ProjectCard({ project }: { project: Project }) {
  const locale = useLocale() as "pt" | "en";
  const t = useTranslations("projectsGrid.filters");
  const tTeam = useTranslations("project.team");
  // Projects without a tech stack list their disciplines; a team credit takes a line of its own below.
  const chips = (project.technologies ?? project.disciplines ?? []).slice(0, 2);

  return (
    <Link
      href={{ pathname: "/projetos/[slug]", params: { slug: project.slug } }}
      className="group block"
    >
      <ImageZoom
        src={project.coverImage.src}
        alt={project.title[locale]}
        width={project.coverImage.width}
        height={project.coverImage.height}
        className="aspect-[16/10] w-full"
      />

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl text-fg transition-colors group-hover:text-accent">
            {project.title[locale]}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-fg-muted">
            {project.tagline[locale]}
          </p>
        </div>
        <span className="shrink-0 text-sm text-fg-muted">{project.year}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-fg/15 px-3 py-1 text-xs uppercase tracking-wide text-fg-muted">
          {t(project.category)}
        </span>
        {chips.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-fg/15 px-3 py-1 text-xs uppercase tracking-wide text-fg-muted"
          >
            {tech}
          </span>
        ))}
      </div>

      {project.credit && (
        <p className="mt-3 flex items-center gap-2 text-xs text-accent">
          <span className="size-1.5 rounded-full bg-accent" />
          {tTeam("badge", { studio: project.credit.studio })}
        </p>
      )}
    </Link>
  );
}
