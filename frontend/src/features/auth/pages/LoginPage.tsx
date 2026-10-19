import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "../../shared/components/Card";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { ErrorState } from "../../shared/components/ErrorState";

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
    <main className="mx-auto max-w-md px-4 py-8 sm:py-12">
      <h1 className="mb-6 font-serif text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
        Iniciar sesión
      </h1>

      {comesFromRegister && (
        <p
          role="status"
          className="mb-4 rounded-xl border-l-4 border-success bg-surface px-4 py-3 text-sm text-foreground"
        >
          Cuenta creada correctamente. Inicia sesión.
        </p>
      )}
      <Card className="shadow-sm">
        <form
          className="space-y-4"
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
          <Input id="email" name="email" label="Email" type="email" />

          <Input
            id="password"
            name="password"
            label="Contraseña"
            type="password"
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>
      </Card>
      {errorMessage && (
        <div className="mt-4">
          <ErrorState message={errorMessage} />
        </div>
      )}
    </main>
  );
}

export default LoginPage;
