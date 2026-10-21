import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { authenticatedLinks, publicLinks } from "../navigation-links";
import { scrollToTop } from "../scroll-to-top";

type AppFooterProps = {
  // Same session state as the top bar: it decides which links are shown
  isAuthenticated: boolean;
};

type SocialLink = {
  label: string;
  icon: ReactNode;
};

const GITHUB_URL = "https://github.com/Las-supernenas/Giftory";

// Giftory has no social accounts yet: the icons are shown but disabled ("Próximamente")
const socialLinks: SocialLink[] = [
  {
    label: "Instagram",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "X",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path d="M13.5 21v-7.5H16l.5-3h-3V8.75c0-.9.3-1.5 1.6-1.5h1.5V4.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.1H8v3h2.5V21h3Z" />
      </svg>
    ),
  },
];

const footerLinkClasses =
  "inline-flex min-h-11 items-center rounded-lg text-sm text-muted no-underline transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-9";

const columnTitleClasses =
  "m-0 mb-2 text-xs font-bold uppercase tracking-widest text-primary";

// Footer shown on every page: brand, link columns and a bottom bar with copyright and social icons
export function AppFooter({ isAuthenticated }: AppFooterProps) {
  const links = isAuthenticated ? authenticatedLinks : publicLinks;
  // Calculated so the copyright never gets old
  const currentYear = new Date().getFullYear();

  return (
    // border-0 first: without Tailwind's reset, border-solid alone would draw all four sides
    <footer className="mt-16 border-0 border-t border-solid border-foreground/10 bg-surface">
      {/* Thin brand line on top: lavender → pink → gold */}
      <div
        aria-hidden="true"
        className="h-1 bg-linear-to-r from-accent-lavender via-accent-dusty-pink to-accent-gold"
      />

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="m-0 font-serif text-2xl font-bold tracking-tight text-primary">
            Giftory
            <span aria-hidden="true" className="ml-1 text-accent-dusty-pink">
              ✦
            </span>
          </p>
          <p className="mt-3 mb-0 max-w-xs text-sm leading-relaxed text-muted">
            Guarda los gustos de las personas que quieres, recuerda sus fechas
            especiales y encuentra el regalo perfecto.
          </p>
        </div>

        {/* A different label so screen readers can tell it apart from the main navigation */}
        <nav
          aria-label="Enlaces del pie de página"
          className="grid grid-cols-2 gap-8 sm:col-span-2"
        >
          <div>
            <h2 className={columnTitleClasses}>Explorar</h2>
            <ul className="m-0 list-none p-0">
              {links.map((link) => (
                <li key={link.to}>
                  {/* onClick also scrolls when the link is the current page (the route does not change) */}
                  <Link
                    to={link.to}
                    onClick={scrollToTop}
                    className={footerLinkClasses}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={columnTitleClasses}>Proyecto</h2>
            <ul className="m-0 list-none p-0">
              <li>
                {/* External link: new tab, without giving the new page access to this one */}
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClasses}
                >
                  Código en GitHub
                  <span aria-hidden="true" className="ml-1">
                    ↗
                  </span>
                  <span className="sr-only">
                    (se abre en una pestaña nueva)
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Bottom bar: soft lavender band, full width */}
      <div className="bg-accent-lavender/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="space-y-1 text-xs text-muted">
            <p className="m-0">© {currentYear} Giftory · Proyecto final</p>
            <p className="m-0">
              Hecho con{" "}
              <span aria-hidden="true" className="text-accent-dusty-pink">
                ♥
              </span>
              <span className="sr-only">amor</span> por{" "}
              <strong className="font-semibold text-primary">
                Las Supernenas
              </strong>
            </p>
          </div>

          <ul
            aria-label="Redes sociales"
            className="m-0 flex list-none gap-2 p-0"
          >
            {socialLinks.map((social) => (
              <li key={social.label}>
                {/* aria-disabled instead of disabled: it stays focusable and the tooltip still works */}
                <button
                  type="button"
                  aria-label={`${social.label} (próximamente)`}
                  aria-disabled="true"
                  title="Próximamente"
                  className="inline-flex h-11 w-11 cursor-default items-center justify-center rounded-full border-0 bg-surface text-primary shadow-sm ring-1 ring-primary/10 transition-colors hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {social.icon}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
