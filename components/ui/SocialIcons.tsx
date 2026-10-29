import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="7" y1="10" x2="7" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="6.8" r="1.2" fill="currentColor" />
      <path
        d="M11 17v-4.2c0-1.5 1-2.6 2.5-2.6s2.5 1.1 2.5 2.6V17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="11" y1="10" x2="11" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function GithubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 2.5c-5.25 0-9.5 4.25-9.5 9.5 0 4.2 2.73 7.77 6.51 9.03.48.09.65-.21.65-.46 0-.23-.01-.84-.01-1.65-2.65.58-3.21-1.28-3.21-1.28-.43-1.11-1.06-1.4-1.06-1.4-.87-.59.07-.58.07-.58.96.07 1.46.98 1.46.98.85 1.46 2.24 1.04 2.78.79.09-.62.34-1.04.61-1.28-2.11-.24-4.34-1.06-4.34-4.71 0-1.04.37-1.89.98-2.55-.1-.24-.42-1.21.09-2.52 0 0 .8-.26 2.62.98a9.03 9.03 0 0 1 4.77 0c1.82-1.24 2.62-.98 2.62-.98.51 1.31.19 2.28.09 2.52.61.66.98 1.51.98 2.55 0 3.66-2.24 4.46-4.37 4.7.35.3.65.89.65 1.79 0 1.29-.01 2.33-.01 2.65 0 .25.17.56.66.46A9.51 9.51 0 0 0 21.5 12c0-5.25-4.25-9.5-9.5-9.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WhatsappIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 2.5c-5.25 0-9.5 4.25-9.5 9.5 0 1.68.44 3.26 1.21 4.63L2.5 21.5l4.99-1.19A9.46 9.46 0 0 0 12 21.5c5.25 0 9.5-4.25 9.5-9.5S17.25 2.5 12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 8.7c.15-.5.55-.5.9-.5h.4c.2 0 .43.03.6.4.2.44.66 1.55.7 1.66.05.11.08.24 0 .39-.07.15-.1.24-.22.37-.12.13-.24.3-.35.4-.12.11-.24.24-.1.48.14.24.6 1 1.3 1.62.9.8 1.63 1.05 1.88 1.17.25.12.4.1.55-.06.15-.16.63-.72.8-.97.17-.25.34-.2.56-.12.23.08 1.46.69 1.71.82.25.12.41.19.47.29.06.11.06.6-.14 1.19-.2.58-1.16 1.11-1.6 1.18-.4.06-.9.09-1.46-.09-.33-.11-.76-.25-1.32-.49-2.32-1-3.83-3.32-3.95-3.48-.12-.16-.94-1.25-.94-2.38 0-1.13.6-1.68.81-1.91Z"
        fill="currentColor"
      />
    </svg>
  );
}
