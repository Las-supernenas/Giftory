import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RegisterPage from "./features/auth/pages/RegisterPage";
import LoginPage from "./features/auth/pages/LoginPage";
import PeoplePage from "./features/people/pages/PeoplePage";
import LibraryPage from "./features/library/pages/LibraryPage";
import DiscoveryPage from "./features/giftideas/pages/DiscoveryPage";
import { AppNavigation } from "./features/shared/components/AppNavigation";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    fetch("/api/users/session")
      .then((response) => setIsAuthenticated(response.ok))
      .catch(() => setIsAuthenticated(false));
    sessionStorage.removeItem("giftoryAccessToken");
  }, []);

  function handleLogin() {
    setIsAuthenticated(true);
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
      setIsAuthenticated(false);
      navigate("/login");
    } catch {
      window.alert("No se pudo cerrar sesión. Inténtalo de nuevo.");
    }
  }

  if (isAuthenticated === null) {
    return <p>Comprobando sesión...</p>;
  }

  return (
    <>
      <AppNavigation
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
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
            isAuthenticated ? <LibraryPage /> : <Navigate to="/login" replace />
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
            <div className="min-h-screen flex items-start justify-center pt-8">
              <h1 className="font-sans text-2xl font-medium tracking-wide text-slate-800">
                Página no encontrada
              </h1>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;
