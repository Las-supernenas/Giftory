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
  "inline-flex w-full min-h-11 items-center justify-center rounded-xl px-1 py-2 text-sm font-medium no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto sm:min-h-9 sm:px-3 sm:py-1 sm:text-base";

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
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-serif text-2xl font-bold tracking-tight text-primary">
          Giftory
          <span aria-hidden="true" className="ml-1 text-accent-dusty-pink">
            ✦
          </span>
        </span>

        <nav
          aria-label="Navegación principal"
          className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center"
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

          {isAuthenticated && (
            <Button
              variant="secondary"
              className="font-sans text-base sm:min-h-9 sm:py-1"
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
