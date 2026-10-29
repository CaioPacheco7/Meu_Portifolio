import { Mail } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { BeamFooter } from "@/components/ui/BeamFooter";
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  WhatsappIcon,
} from "@/components/ui/SocialIcons";
import {
  FORJA_STUDIO_NAME,
  FORJA_STUDIO_URL,
  NAV_LINKS,
  SOCIAL_LINKS,
} from "@/lib/constants";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <BeamFooter
      wordmark="Caio Pacheco"
      label={`© ${year} Caio Pacheco. ${t("footer.rights")}`}
      socials={[
        { label: t("social.instagram"), href: SOCIAL_LINKS.instagram, icon: <InstagramIcon /> },
        { label: t("social.linkedin"), href: SOCIAL_LINKS.linkedin, icon: <LinkedinIcon /> },
        { label: t("social.github"), href: SOCIAL_LINKS.github, icon: <GithubIcon /> },
        { label: t("social.whatsapp"), href: SOCIAL_LINKS.whatsapp, icon: <WhatsappIcon /> },
        { label: t("social.email"), href: SOCIAL_LINKS.email, icon: <Mail /> },
      ]}
      credits={[
        { lead: t("footer.description") },
        {
          lead: t("footer.workingAt.lead"),
          label: FORJA_STUDIO_NAME,
          href: FORJA_STUDIO_URL,
          tail: t("footer.workingAt.tail"),
        },
      ]}
      columns={[
        {
          title: t("footer.navigation"),
          // keep the language: "/#projetos" would drop the /pt or /en prefix
          links: NAV_LINKS.map((link) => ({
            label: t(`nav.${link.key}`),
            href: `/${locale}${link.href.slice(1)}`,
          })),
        },
        {
          title: t("footer.connect"),
          links: [
            { label: t("social.whatsapp"), href: SOCIAL_LINKS.whatsapp },
            { label: t("social.email"), href: SOCIAL_LINKS.email },
            { label: FORJA_STUDIO_NAME, href: FORJA_STUDIO_URL },
          ],
        },
      ]}
    />
  );
}
