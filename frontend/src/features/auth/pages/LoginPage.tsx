import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "../../shared/components/Card";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { ErrorState } from "../../shared/components/ErrorState";
import type { CurrentUser } from "../types/current-user";

type LoginPageProps = {
  onLogin: (user: CurrentUser) => void;
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
    <main className="mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-5xl items-center justify-center px-4 py-10 sm:px-6">
      <section className="w-full max-w-lg">
        {comesFromRegister && (
          <p
            role="status"
            className="mb-4 rounded-xl border border-success/25 bg-surface/95 px-4 py-3 text-sm text-foreground shadow-sm shadow-primary/5 backdrop-blur-sm"
          >
            Cuenta creada correctamente. Inicia sesión.
          </p>
        )}
        <Card className="w-full border-accent-gold/30! bg-surface/95! p-6 shadow-xl shadow-primary/10 backdrop-blur-sm sm:p-8">
          <header className="mb-6">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              <span aria-hidden="true" className="text-accent-gold">✦</span>
              Giftory · detalles que importan
            </p>
            <h1 className="m-0 font-serif text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
              Iniciar sesión
            </h1>
            <p className="mb-0 mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Vuelve a tus personas especiales y a las ideas que guardaste para ellas.
            </p>
          </header>
        <form
          className="space-y-5"
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
                // The login response also has the email: we only keep id and name
                const data = (await response.json()) as { user: CurrentUser };
                onLogin({ id: data.user.id, name: data.user.name });
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

          <Button
            type="submit"
            disabled={isLoading}
            className="min-h-12 w-full text-base font-semibold shadow-sm shadow-primary/10"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>
          {errorMessage && (
            <div className="mt-5">
              <ErrorState message={errorMessage} />
            </div>
          )}
        </Card>
      </section>
    </main>
  );
}

export default LoginPage;
