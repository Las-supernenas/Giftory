import {
  Route,
  Routes,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import RegisterPage from "./features/auth/pages/RegisterPage";
import LoginPage from "./features/auth/pages/LoginPage";
import PeoplePage from "./features/people/pages/PeoplePage";
import LibraryPage from "./features/library/pages/LibraryPage";
import DiscoveryPage from "./features/giftideas/pages/DiscoveryPage";
import { AppNavigation } from "./features/shared/components/AppNavigation";
import { AppFooter } from "./features/shared/components/AppFooter";
import type { CurrentUser } from "./features/auth/types/current-user";
import { scrollToTop } from "./features/shared/scroll-to-top";

function App() {
  // null = no session. The cookie is HttpOnly: we only keep the user's public data
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const isAuthenticated = currentUser !== null;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // React Router keeps the scroll position when the page changes: go back to the top
  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  // On page load (also after a refresh) ask the backend who is logged in
  useEffect(() => {
    fetch("/api/users/session")
      .then(async (response) => {
        if (!response.ok) {
          setCurrentUser(null);
          return;
        }
        const user = (await response.json()) as CurrentUser;
        setCurrentUser({ id: user.id, name: user.name });
      })
      .catch(() => setCurrentUser(null))
      .finally(() => setIsCheckingSession(false));
    sessionStorage.removeItem("giftoryAccessToken");
  }, []);

  function handleLogin(user: CurrentUser) {
    setCurrentUser(user);
    navigate("/");
  }

  function handleRegister() {
    // Registration does not log the user in: sends them to Login with a success notice
    navigate("/login", { state: { registered: true } });
  }

  async function handleLogout() {
    try {
      const response = await fetch("/api/users/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      setCurrentUser(null);
      navigate("/login");
    } catch {
      window.alert("No se pudo cerrar sesión. Inténtalo de nuevo.");
    }
  }

  if (isCheckingSession) {
    return <p>Comprobando sesión...</p>;
  }

  return (
    // Full-height column: the page grows (flex-1) so the footer stays at the bottom on short pages
    <div className="flex min-h-svh flex-col">
      <AppNavigation
        userName={currentUser?.name ?? null}
        onLogout={handleLogout}
      />
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={<DiscoveryPage isAuthenticated={isAuthenticated} />}
          />

          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

          <Route
            path="/register"
            element={<RegisterPage onRegister={handleRegister} />}
          />

          <Route
            path="/library"
            element={
              isAuthenticated ? (
                <LibraryPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/people"
            element={
              isAuthenticated ? (
                <div>
                  <PeoplePage />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="*"
            element={
              <div className="flex items-start justify-center pt-8">
                <h1 className="font-sans text-2xl font-medium tracking-wide text-slate-800">
                  Página no encontrada
                </h1>
              </div>
            }
          />
        </Routes>
      </div>
      <AppFooter isAuthenticated={isAuthenticated} />
    </div>
  );
}

export default App;
