import { NavLink } from "react-router-dom";
import { Button } from "./Button";

type AppNavigationProps = {
  isAuthenticated: boolean;
  onLogout: () => void;
};

type NavigationLink = {
  to: string;
  label: string;
};

//Main areas of the app. Discovery is public, People and Library need a session
const authenticatedLinks: NavigationLink[] = [
  { to: "/", label: "Descubrir" },
  { to: "/people", label: "Personas" },
  { to: "/library", label: "Biblioteca" },
];

const publicLinks: NavigationLink[] = [
  { to: "/", label: "Descubrir" },
  { to: "/login", label: "Iniciar sesión" },
  { to: "/register", label: "Crear cuenta" },
];

const linkBaseClasses =
  "inline-flex min-h-11 items-center rounded-xl px-3 py-2 font-medium no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-9 sm:py-1";

// NavLink tells us if the link is the current page (isActive) and adds aria-current="page"
function getLinkClasses({ isActive }: { isActive: boolean }): string {
  return `${linkBaseClasses} ${
    isActive
      ? "bg-primary text-white"
      : "text-foreground hover:bg-accent-lavender/30"
  }`;
}

export function AppNavigation({
  isAuthenticated,
  onLogout,
}: AppNavigationProps) {
  const links = isAuthenticated ? authenticatedLinks : publicLinks;

  return (
    <header className="border-b border-solid border-foreground/10 bg-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-2">
        <span className="text-xl font-semibold text-primary">Giftory</span>

        <nav
          aria-label="Navegación principal"
          className="flex flex-wrap items-center gap-2"
        >
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {links.map((link) => (
              <li key={link.to}>
                {/* end: "/" is only active on Discovery, not on every route */}
                <NavLink to={link.to} end className={getLinkClasses}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {isAuthenticated && (
            <Button
              variant="secondary"
              className="sm:min-h-9 sm:py-1"
              onClick={onLogout}
            >
              Cerrar sesión
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
