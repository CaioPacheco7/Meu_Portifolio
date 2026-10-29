export type ProjectCategory =
  | "sites"
  | "landing-pages"
  | "ecommerce"
  | "dashboard"
  | "aplicativos";

export interface LocalizedText {
  pt: string;
  en: string;
}

export interface ProjectImage {
  src: string;
  width: number;
  height: number;
}

export interface ProjectGalleryImage extends ProjectImage {
  alt: LocalizedText;
}

export interface ProjectResultMetric {
  label: LocalizedText;
  value: string;
}

/** Set when a project was built as a team: shown with a note and a link back to the studio. */
export interface ProjectCredit {
  studio: string;
  url: string;
}

export interface Project {
  slug: string;
  category: ProjectCategory;
  year: number;
  client: string;
  featured: boolean;
  order: number;

  coverImage: ProjectImage;
  gallery: ProjectGalleryImage[];

  /** Tech stack, when known. */
  technologies?: string[];
  /** Disciplines involved (Web Design, Admin Panel...), for projects that list those instead of a stack. */
  disciplines?: string[];

  title: LocalizedText;
  tagline: LocalizedText;
  summary: LocalizedText;
  // The case-study sections are optional: a project only shows what is actually known about it.
  problem?: LocalizedText;
  objectives?: LocalizedText[];
  solution?: LocalizedText;
  process?: LocalizedText;

  results?: {
    summary: LocalizedText;
    metrics: ProjectResultMetric[];
  };

  credit?: ProjectCredit;

  liveUrl?: string;
  repoUrl?: string;
}
