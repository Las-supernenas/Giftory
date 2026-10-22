import { NavLink } from "react-router-dom";
import { authenticatedLinks, publicLinks } from "../navigation-links";

type AppNavigationProps = {
  // Name of the logged-in user, null when there is no session
  userName: string | null;
  onLogout: () => void;
};

const linkBaseClasses =
  "inline-flex w-full min-h-10 items-center justify-center rounded-xl px-2 py-1.5 text-sm font-medium no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto sm:px-4 sm:text-base";

// NavLink tells us if the link is the current page (isActive) and adds aria-current="page"
function getLinkClasses({ isActive }: { isActive: boolean }): string {
  return `${linkBaseClasses} ${
    isActive
      ? "bg-accent-lavender/25 text-primary shadow-sm shadow-primary/5"
      : "text-foreground/80 hover:bg-accent-lavender/15"
  }`;
}

// First letter of the name for the avatar ("?" if the name is empty)
function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function AppNavigation({ userName, onLogout }: AppNavigationProps) {
  const isAuthenticated = userName !== null;
  const links = isAuthenticated ? authenticatedLinks : publicLinks;

  return (
    <header className="border-b border-solid border-accent-lavender/20 bg-surface/90 shadow-sm shadow-primary/5 backdrop-blur-md">
      {/* Mobile: logo + user on the first row, links in a full-width second row.
          Desktop: logo + links on the left, user on the right */}
      <div className="flex w-full flex-wrap items-center gap-x-8 gap-y-2 px-4 py-1.5 sm:px-6 lg:px-8">
        <span className="font-serif text-2xl font-bold tracking-tight text-primary">
          Giftory
          <span aria-hidden="true" className="ml-1 text-accent-dusty-pink">
            ✦
          </span>
        </span>

        <nav
          aria-label="Navegación principal"
          className="order-last w-full sm:order-none sm:w-auto"
        >
          <ul className="m-0 grid w-full grid-cols-3 list-none gap-1 p-0 sm:flex sm:w-auto sm:gap-2">
            {links.map((link) => (
              <li key={link.to}>
                {/* end: "/" is only active on Discovery, not on every route */}
                <NavLink to={link.to} end className={getLinkClasses}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {isAuthenticated && (
          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            <span
              aria-hidden="true"
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-lavender/30 font-bold text-primary sm:inline-flex"
            >
              {getInitial(userName)}
            </span>
            <p className="m-0 min-w-0 truncate text-sm sm:text-base">
              ¡Hola, <strong className="text-primary">{userName}</strong>!
            </p>
            {/* Secondary action: white with navy border. Icon only on mobile */}
            <button
              type="button"
              aria-label="Cerrar sesión"
              onClick={onLogout}
              className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-solid border-primary bg-surface px-2 text-base font-medium text-primary hover:bg-accent-lavender/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 sm:hidden"
              >
                <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
              </svg>
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
