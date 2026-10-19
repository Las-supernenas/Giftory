import { useState } from "react";
import { useLocation } from "react-router-dom";

type LoginPageProps = {
  onLogin: () => void;
};

// Data that can arrive with the navigation to /login (sent by the app after a successful registration)
type LoginLocationState = {
  registered?: boolean;
} | null;

function LoginPage({ onLogin }: LoginPageProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const locationState = location.state as LoginLocationState;
  const comesFromRegister = locationState?.registered === true;

  return (
    <main>
      <h1>Iniciar sesión</h1>

      {comesFromRegister && (
        <p role="status">Cuenta creada correctamente. Inicia sesión</p>
      )}

      <form
        onSubmit={async (event) => {
          event.preventDefault();

          setErrorMessage("");

          const formData = new FormData(event.currentTarget);

          setIsLoading(true);

          try {
            const response = await fetch("/api/users/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: formData.get("email"),
                password: formData.get("password"),
              }),
            });

            if (response.ok) {
              onLogin();
            } else if (response.status === 401) {
              setErrorMessage("Email o contraseña incorrectos.");
            } else if (response.status === 400) {
              setErrorMessage("Revisa el email y la contraseña.");
            } else {
              setErrorMessage(
                "No se pudo completar el inicio de sesión. Inténtalo más tarde.",
              );
            }
          } catch {
            setErrorMessage("No se pudo conectar con el servidor.");
          } finally {
            setIsLoading(false);
          }
        }}
      >
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />

        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>
      <p>{errorMessage}</p>
    </main>
  );
}

export default LoginPage;
