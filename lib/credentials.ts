import type { LocalizedText } from "@/types";

export type CredentialKind = "degree" | "extension" | "certificate";

export interface Credential {
  id: string;
  year: number;
  /** 1–12, shown as the month's name. */
  month: number;
  kind: CredentialKind;
  title: LocalizedText;
  issuer: string;
  hours?: number;
  /** Short chips: what the course covered. Only what the certificate or transcript states. */
  topics?: LocalizedText[];
}

/**
 * Newest first, in the order they are shown.
 *
 * Only facts that are fine to publish live here: course, issuer, date, hours.
 * The documents themselves carry ID numbers (CPF, RG, and so on) and must never
 * be added to the site, not even under `public/`.
 */
export const credentials: Credential[] = [
  {
    id: "unifg-ads",
    year: 2026,
    month: 8,
    kind: "degree",
    title: {
      pt: "Análise e Desenvolvimento de Sistemas",
      en: "Systems Analysis and Development",
    },
    issuer: "Centro Universitário UniFG",
    hours: 2030,
    topics: [
      { pt: "Modelagem de software", en: "Software modeling" },
      { pt: "Programação", en: "Programming" },
      { pt: "Desenvolvimento web", en: "Web development" },
      { pt: "Sistemas distribuídos e mobile", en: "Distributed and mobile systems" },
      { pt: "Segurança de sistemas", en: "Systems security" },
      { pt: "Engenharia e qualidade de software", en: "Software engineering and quality" },
    ],
  },
  {
    id: "academy-web",
    year: 2026,
    month: 6,
    kind: "extension",
    title: {
      pt: "Desenvolvimento de Software para Web",
      en: "Web Software Development",
    },
    issuer: "Academy Educação",
    hours: 180,
    topics: [
      { pt: "Fundamentos da programação web", en: "Web programming fundamentals" },
      { pt: "Back-end", en: "Back-end" },
      { pt: "Persistência de dados", en: "Data persistence" },
      { pt: "Segurança de software", en: "Software security" },
      { pt: "Publicação na nuvem", en: "Cloud deployment" },
    ],
  },
  {
    id: "cisco-networking-basics",
    year: 2024,
    month: 11,
    kind: "certificate",
    title: { pt: "Networking Basics", en: "Networking Basics" },
    issuer: "Cisco Networking Academy",
    topics: [
      { pt: "Protocolos e padrões de rede", en: "Network standards and protocols" },
      { pt: "IPv4 e IPv6", en: "IPv4 and IPv6" },
      { pt: "Ethernet e roteamento", en: "Ethernet and routing" },
      { pt: "Diagnóstico de conectividade", en: "Connectivity troubleshooting" },
      { pt: "Wi-Fi seguro", en: "Secure wireless setup" },
    ],
  },
  {
    id: "oracle-database-design",
    year: 2024,
    month: 5,
    kind: "certificate",
    title: { pt: "Database Design", en: "Database Design" },
    issuer: "Oracle Academy",
  },
  {
    id: "oracle-java-foundations",
    year: 2024,
    month: 5,
    kind: "certificate",
    title: { pt: "Java Foundations", en: "Java Foundations" },
    issuer: "Oracle Academy",
  },
];
