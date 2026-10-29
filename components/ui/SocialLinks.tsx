import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  WhatsappIcon,
} from "@/components/ui/SocialIcons";
import { SOCIAL_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NETWORKS = [
  { key: "instagram", href: SOCIAL_LINKS.instagram, Icon: InstagramIcon },
  { key: "linkedin", href: SOCIAL_LINKS.linkedin, Icon: LinkedinIcon },
  { key: "github", href: SOCIAL_LINKS.github, Icon: GithubIcon },
  { key: "whatsapp", href: SOCIAL_LINKS.whatsapp, Icon: WhatsappIcon },
  { key: "email", href: SOCIAL_LINKS.email, Icon: Mail },
] as const;

/** Every network as a named pill, for where the links are the point (the contact screen). */
export function SocialLinks({ className }: { className?: string }) {
  const t = useTranslations("social");

  return (
    <ul className={cn("flex flex-wrap justify-center gap-3", className)}>
      {NETWORKS.map(({ key, href, Icon }) => (
        <li key={key}>
          <a
            href={href}
            {...(href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noreferrer" })}
            className="inline-flex items-center gap-2.5 rounded-full border border-fg/15 px-5 py-2.5 text-sm text-fg-muted transition-colors hover:border-accent hover:text-fg"
          >
            <Icon width={16} height={16} aria-hidden />
            {t(key)}
          </a>
        </li>
      ))}
    </ul>
  );
}
