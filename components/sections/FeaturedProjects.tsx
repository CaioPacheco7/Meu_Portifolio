"use client";

import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Container } from "@/components/ui/Container";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { getFeaturedProjects } from "@/lib/projects";

export function FeaturedProjects() {
  const t = useTranslations("featuredProjects");
  const projects = getFeaturedProjects();

  // with nothing marked `featured` in lib/projects.ts, the whole section steps aside
  if (projects.length === 0) return null;

  return (
    <section className="pt-20 md:pt-28">
      <Container>
        <RevealOnScroll>
          <h2 className="font-serif text-4xl sm:text-5xl">{t("title")}</h2>
        </RevealOnScroll>

        <div className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <RevealOnScroll key={project.slug} delay={(index % 3) * 0.08}>
              <ProjectCard project={project} />
            </RevealOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}
