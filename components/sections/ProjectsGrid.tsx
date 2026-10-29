"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Container } from "@/components/ui/Container";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { getProjectsByCategory, projects } from "@/lib/projects";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import type { ProjectCategory } from "@/types/project";

type FilterValue = ProjectCategory | "all";

// a tab for a category with no project would only show an empty grid
const CATEGORIES = PROJECT_CATEGORIES.filter((category) =>
  projects.some((project) => project.category === category),
);

export function ProjectsGrid() {
  const t = useTranslations("projectsGrid");
  const [filter, setFilter] = useState<FilterValue>("all");

  const options = useMemo(
    () => [
      { value: "all" as const, label: t("filters.all") },
      ...CATEGORIES.map((category) => ({
        value: category,
        label: t(`filters.${category}`),
      })),
    ],
    [t],
  );

  const filteredProjects = useMemo(
    () => getProjectsByCategory(filter),
    [filter],
  );

  return (
    <section id="projetos" className="py-30 md:py-38">
      <Container>
        <RevealOnScroll>
          <h2 className="font-serif text-4xl sm:text-5xl">{t("title")}</h2>
        </RevealOnScroll>

        <div className="mt-10">
          <FilterTabs options={options} value={filter} onChange={setFilter} />
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <RevealOnScroll key={project.slug} delay={(index % 3) * 0.08}>
              <ProjectCard project={project} />
            </RevealOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}
