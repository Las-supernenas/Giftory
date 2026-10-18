import { useState } from "react";

type LoginPageProps = {
  onLogin: () => void;
};

function LoginPage({ onLogin }: LoginPageProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  return (
    <main>
      <h1>Iniciar sesión</h1>

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
