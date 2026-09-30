import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

function App() {
  const [apiStatus, setApiStatus] = useState("Comprobando API...");

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
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen flex items-start justify-center pt-8">
              <h1 className="font-serif text-4xl font-semibold tracking-tight">
                Giftory
              </h1>
              <p>{apiStatus}</p>
            </div>
          }
        />

        <Route
          path="/login"
          element={
            <div className="min-h-screen flex items-start justify-center pt-8">
              <h1 className="font-sans text-2xl font-medium tracking-wide">
                Login
              </h1>
            </div>
          }
        />

        <Route
          path="/register"
          element={
            <div className="min-h-screen flex items-start justify-center pt-8">
              <h1 className="font-sans text-2xl font-medium tracking-wide">
                Register
              </h1>
            </div>
          }
        />

        <Route
          path="/library"
          element={
            <div className="min-h-screen flex items-start justify-center pt-8">
              <h1 className="font-sans text-2xl font-medium tracking-wide">
                Library
              </h1>
            </div>
          }
        />

        <Route
          path="/people"
          element={
            <div className="min-h-screen flex items-start justify-center pt-8">
              <h1 className="font-sans text-2xl font-medium tracking-wide text-slate-800">
                People
              </h1>
            </div>
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
