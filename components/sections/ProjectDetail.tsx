"use client";

import { useLocale } from "next-intl";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ImageZoom } from "@/components/ui/ImageZoom";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { RevealText } from "@/components/ui/RevealText";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

interface ProjectDetailLabels {
  summary: string;
  problem: string;
  objectives: string;
  solution: string;
  process: string;
  gallery: string;
  results: string;
  technologies: string;
  disciplines: string;
  nextProject: string;
  visitSite: string;
  backToProjects: string;
  teamNote: string;
  teamLink: string;
}

export function ProjectDetail({
  project,
  nextProject,
  labels,
}: {
  project: Project;
  nextProject: Project;
  labels: ProjectDetailLabels;
}) {
  const locale = useLocale() as "pt" | "en";

  // Only what is actually known about a project is shown.
  const hasBrief = Boolean(project.problem || project.objectives?.length);
  const hasOutcome = Boolean(
    project.results ||
      project.technologies?.length ||
      project.disciplines?.length,
  );

  return (
    <article className="pt-32">
      <Container>
        <Link
          href="/projetos"
          className="inline-flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg"
        >
          <ArrowLeft size={14} />
          {labels.backToProjects}
        </Link>

        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <RevealText as="h1" className="font-serif text-5xl sm:text-6xl lg:text-7xl">
            {project.title[locale]}
          </RevealText>

          <div className="flex gap-8 text-sm text-fg-muted">
            <div>
              <p className="uppercase tracking-wide">{project.client}</p>
            </div>
            <div>
              <p className="uppercase tracking-wide">{project.year}</p>
            </div>
          </div>
        </div>

        <RevealOnScroll className="mt-12">
          <ImageZoom
            src={project.coverImage.src}
            alt={project.title[locale]}
            width={project.coverImage.width}
            height={project.coverImage.height}
            className="aspect-[16/10] w-full"
            preload
            sizes="100vw"
          />
        </RevealOnScroll>

        {project.liveUrl && (
          <div className="mt-6">
            <Button href={project.liveUrl} variant="accent" className="w-full justify-center sm:w-auto">
              {labels.visitSite}
              <ArrowUpRight size={18} aria-hidden />
            </Button>
          </div>
        )}

        {project.credit && (
          <RevealOnScroll className="mt-10">
            <div className="flex flex-col gap-4 rounded-xl border border-fg/15 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <p className="flex items-start gap-3 text-sm leading-relaxed text-fg-muted">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                {labels.teamNote}
              </p>
              <a
                href={project.credit.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-2 text-sm text-fg underline decoration-accent underline-offset-4 transition-colors hover:text-accent"
              >
                {labels.teamLink}
                <ArrowUpRight size={16} />
              </a>
            </div>
          </RevealOnScroll>
        )}

        <div className={cn("mt-20 grid gap-16", hasBrief && "lg:grid-cols-[1fr_1fr]")}>
          <RevealOnScroll className={hasBrief ? undefined : "max-w-3xl"}>
            <h2 className="text-sm uppercase tracking-widest text-accent">
              {labels.summary}
            </h2>
            <p className="mt-4 font-serif text-2xl leading-relaxed">
              {project.summary[locale]}
            </p>
          </RevealOnScroll>

          {hasBrief && (
            <div className="grid gap-10 sm:grid-cols-2">
              {project.problem && (
                <RevealOnScroll delay={0.05}>
                  <h3 className="text-sm uppercase tracking-widest text-fg-muted">
                    {labels.problem}
                  </h3>
                  <p className="mt-3 text-fg-muted">{project.problem[locale]}</p>
                </RevealOnScroll>
              )}

              {project.objectives && project.objectives.length > 0 && (
                <RevealOnScroll delay={0.1}>
                  <h3 className="text-sm uppercase tracking-widest text-fg-muted">
                    {labels.objectives}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {project.objectives.map((objective, index) => (
                      <li key={index} className="text-fg-muted">
                        — {objective[locale]}
                      </li>
                    ))}
                  </ul>
                </RevealOnScroll>
              )}
            </div>
          )}
        </div>

        {(project.solution || project.process) && (
          <div className="mt-20 grid gap-16 lg:grid-cols-2">
            {project.solution && (
              <RevealOnScroll>
                <h2 className="text-sm uppercase tracking-widest text-accent">
                  {labels.solution}
                </h2>
                <p className="mt-4 text-lg text-fg-muted">
                  {project.solution[locale]}
                </p>
              </RevealOnScroll>
            )}

            {project.process && (
              <RevealOnScroll delay={0.05}>
                <h2 className="text-sm uppercase tracking-widest text-accent">
                  {labels.process}
                </h2>
                <p className="mt-4 text-lg text-fg-muted">
                  {project.process[locale]}
                </p>
              </RevealOnScroll>
            )}
          </div>
        )}

        {project.gallery.length > 0 && (
          <div className="mt-24">
            <RevealOnScroll>
              <h2 className="text-sm uppercase tracking-widest text-accent">
                {labels.gallery}
              </h2>
            </RevealOnScroll>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {project.gallery.map((image, index) => (
                <RevealOnScroll key={image.src} delay={index * 0.08}>
                  <ImageZoom
                    src={image.src}
                    alt={image.alt[locale]}
                    width={image.width}
                    height={image.height}
                    className="aspect-[16/10] w-full"
                  />
                </RevealOnScroll>
              ))}
            </div>
          </div>
        )}

        {hasOutcome && (
          <div className="mt-24 grid gap-16 border-t border-fg/10 pt-16 lg:grid-cols-[1fr_1fr]">
            {project.results && (
              <RevealOnScroll>
                <h2 className="text-sm uppercase tracking-widest text-accent">
                  {labels.results}
                </h2>
                <p className="mt-4 text-lg text-fg-muted">
                  {project.results.summary[locale]}
                </p>

                {project.results.metrics.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-10">
                    {project.results.metrics.map((metric, index) => (
                      <div key={index}>
                        <p className="font-serif text-4xl text-fg">
                          {metric.value}
                        </p>
                        <p className="mt-1 text-sm text-fg-muted">
                          {metric.label[locale]}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </RevealOnScroll>
            )}

            {(project.technologies?.length || project.disciplines?.length) && (
              <RevealOnScroll delay={0.05}>
                {project.technologies && project.technologies.length > 0 && (
                  <>
                    <h2 className="text-sm uppercase tracking-widest text-accent">
                      {labels.technologies}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-fg/15 px-4 py-1.5 text-sm text-fg-muted"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {project.disciplines && project.disciplines.length > 0 && (
                  <div className={project.technologies?.length ? "mt-8" : undefined}>
                    <h2 className="text-sm uppercase tracking-widest text-accent">
                      {labels.disciplines}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.disciplines.map((discipline) => (
                        <span
                          key={discipline}
                          className="rounded-full border border-fg/15 px-4 py-1.5 text-sm text-fg-muted"
                        >
                          {discipline}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </RevealOnScroll>
            )}
          </div>
        )}
      </Container>

      <Link
        href={{ pathname: "/projetos/[slug]", params: { slug: nextProject.slug } }}
        className="group mt-32 flex min-h-[50vh] flex-col items-center justify-center border-t border-fg/10 text-center transition-colors hover:bg-bg-surface"
      >
        <span className="text-sm uppercase tracking-widest text-fg-muted">
          {labels.nextProject}
        </span>
        <span className="mt-4 font-serif text-5xl transition-colors group-hover:text-accent sm:text-6xl">
          {nextProject.title[locale]}
        </span>
      </Link>
    </article>
  );
}
