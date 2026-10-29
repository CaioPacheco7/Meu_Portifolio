import type { Project, ProjectCategory } from "@/types/project";
import { FORJA_PORTFOLIO_URL, FORJA_STUDIO_NAME } from "@/lib/constants";

/** Projects built as a team at Forja Studio, not alone. */
const FORJA_CREDIT = { studio: FORJA_STUDIO_NAME, url: FORJA_PORTFOLIO_URL };

export const projects: Project[] = [
  {
    slug: "citomed",
    category: "sites",
    year: 2026,
    client: "Citomed",
    featured: false,
    order: 1,
    coverImage: { src: "/images/projects/citomed/cover-real.jpg", width: 2400, height: 1500 },
    gallery: [
      {
        src: "/images/projects/citomed/gallery-1.jpg",
        alt: { pt: "Seção de acesso rápido do site", en: "Quick-access section of the site" },
        width: 2400,
        height: 1500,
      },
      {
        src: "/images/projects/citomed/gallery-2.jpg",
        alt: { pt: "Seção institucional com carrossel", en: "About section with a carousel" },
        width: 2400,
        height: 1500,
      },
    ],
    disciplines: ["Web Design", "Web Development"],
    title: { pt: "Citomed", en: "Citomed" },
    tagline: {
      pt: "Site clínico focado em confiança e no agendamento de exames.",
      en: "A clinical website focused on trust and on booking exams.",
    },
    summary: {
      pt: "Desenvolvemos um site clínico focado em transmitir confiança e facilitar o agendamento de exames.",
      en: "We built a clinical website focused on conveying trust and making it easy to book exams.",
    },
    liveUrl: "https://www.citomedlaboratorio.com.br/",
    credit: FORJA_CREDIT,
  },
  {
    slug: "essara",
    category: "ecommerce",
    year: 2026,
    client: "Éssara",
    featured: false,
    order: 2,
    coverImage: { src: "/images/projects/essara/cover-real.jpg", width: 2400, height: 1500 },
    gallery: [
      {
        src: "/images/projects/essara/gallery-1.jpg",
        alt: { pt: "Categorias do catálogo", en: "Catalogue categories" },
        width: 2400,
        height: 1500,
      },
      {
        src: "/images/projects/essara/gallery-2.jpg",
        alt: { pt: "Coleções em destaque", en: "Featured collections" },
        width: 2400,
        height: 1500,
      },
    ],
    disciplines: ["Web Design", "Web Development", "Admin Panel"],
    title: { pt: "Éssara", en: "Éssara" },
    tagline: {
      pt: "Catálogo de semijoias com painel próprio e pedido pelo WhatsApp.",
      en: "A demi-fine jewelry catalogue with its own admin panel and ordering via WhatsApp.",
    },
    summary: {
      pt: "Catálogo digital de semijoias com painel administrativo próprio, onde o pedido se fecha numa conversa de WhatsApp, não num checkout.",
      en: "A digital catalogue of demi-fine jewelry with its own admin panel, where the order closes in a WhatsApp conversation, not at a checkout.",
    },
    liveUrl: "https://lojaessara.com.br/",
    credit: FORJA_CREDIT,
  },
  {
    slug: "bruna-prates",
    category: "sites",
    year: 2026,
    client: "Bruna Prates",
    featured: false,
    order: 3,
    coverImage: { src: "/images/projects/bruna-prates/cover-real.jpg", width: 2400, height: 1500 },
    gallery: [
      {
        src: "/images/projects/bruna-prates/gallery-1.jpg",
        alt: { pt: "Seção de especialidades", en: "Specialties section" },
        width: 2400,
        height: 1500,
      },
      {
        src: "/images/projects/bruna-prates/gallery-2.jpg",
        alt: { pt: "Seção sobre a profissional", en: "About section" },
        width: 2400,
        height: 1500,
      },
    ],
    disciplines: ["UX Strategy", "Web Design", "Web Development"],
    title: { pt: "Bruna Prates", en: "Bruna Prates" },
    tagline: {
      pt: "Site institucional editorial para uma terapeuta ocupacional.",
      en: "An editorial website for an occupational therapist.",
    },
    summary: {
      pt: "Site institucional para uma Terapeuta Ocupacional, com design editorial premium e depoimentos, FAQ e agendamento integrados.",
      en: "A website for an occupational therapist, with premium editorial design and testimonials, FAQ and appointment booking built in.",
    },
    liveUrl: "https://portifoliobrunaprates.vercel.app/",
    credit: FORJA_CREDIT,
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects
    .filter((project) => project.featured)
    .sort((a, b) => a.order - b.order);
}

export function getProjectsByCategory(
  category: ProjectCategory | "all",
): Project[] {
  const filtered =
    category === "all"
      ? projects
      : projects.filter((project) => project.category === category);

  return [...filtered].sort((a, b) => a.order - b.order);
}

export function getAdjacentProject(slug: string): Project {
  const sorted = [...projects].sort((a, b) => a.order - b.order);
  const currentIndex = sorted.findIndex((project) => project.slug === slug);
  const nextIndex = (currentIndex + 1) % sorted.length;
  return sorted[nextIndex];
}
