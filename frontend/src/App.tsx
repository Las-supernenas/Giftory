import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RegisterPage from "./features/auth/pages/RegisterPage";
import LoginPage from "./features/auth/pages/LoginPage";
import PeoplePage from "./features/people/pages/PeoplePage";
import LibraryPage from "./features/library/pages/LibraryPage";

function App() {
  const [apiStatus, setApiStatus] = useState("Comprobando API...");
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    sessionStorage.getItem("giftoryAccessToken"),
  );
  const isAuthenticated = Boolean(accessToken);
  const navigate = useNavigate();

  function handleLogin(token: string) {
    sessionStorage.setItem("giftoryAccessToken", token);
    setAccessToken(token);
  }

  function handleLogout() {
    sessionStorage.removeItem("giftoryAccessToken");
    setAccessToken(null);
    navigate("/login");
  }

  useEffect(() => {
    async function checkApi() {
      try {
        const response = await fetch("/api/health");

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: { status: string } = await response.json();
        setApiStatus(`API: ${data.status}`);
      } catch {
        setApiStatus("No se pudo conectar con la API.");
      }
    }

    void checkApi();
  }, []);

  return (
    <>
      {isAuthenticated && <button onClick={handleLogout}>Cerrar sesión</button>}
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen flex items-start justify-center pt-8">
              <h1 className="font-serif text-4xl font-semibold tracking-tight">
                Giftory
              </h1>
              <p>{apiStatus}</p>
              <p>{isAuthenticated ? "Sesión iniciada" : "Sin sesión"}</p>
            </div>
          }
        />

        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/library"
          element={
            accessToken ? (
              <LibraryPage accessToken={accessToken} />
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
            <div className="min-h-screen flex items-start justify-center pt-8">
              <h1 className="font-sans text-2xl font-medium tracking-wide text-slate-800">
                Pagina no encontrada
              </h1>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;
