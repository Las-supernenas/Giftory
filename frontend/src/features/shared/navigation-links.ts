// Links shared by the top navigation (AppNavigation) and the footer (AppFooter)

export type NavigationLink = {
  to: string;
  label: string;
};

//Main areas of the app. Discovery is public, People and Library need a session
export const authenticatedLinks: NavigationLink[] = [
  { to: "/", label: "Descubrir" },
  { to: "/people", label: "Personas" },
  { to: "/library", label: "Biblioteca" },
];

export const publicLinks: NavigationLink[] = [
  { to: "/", label: "Descubrir" },
  { to: "/login", label: "Iniciar sesión" },
  { to: "/register", label: "Crear cuenta" },
];
