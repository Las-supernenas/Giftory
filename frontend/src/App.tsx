import { Route, Routes } from "react-router-dom";

function App() {
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
