import { useState } from "react";
import { Card } from "../../shared/components/Card";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { ErrorState } from "../../shared/components/ErrorState";

type RegisterPageProps = {
  onRegister: () => void;
};

function RegisterPage({ onRegister }: RegisterPageProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-5xl items-center justify-center px-4 py-10 sm:px-6">
      <section className="w-full max-w-lg">
      <Card className="w-full border-accent-gold/30! bg-surface/95! p-6 shadow-xl shadow-primary/10 backdrop-blur-sm sm:p-8">
        <header className="mb-6">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            <span aria-hidden="true" className="text-accent-gold">✦</span>
            Giftory · detalles que importan
          </p>
          <h1 className="m-0 font-serif text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
            Crear cuenta
          </h1>
          <p className="mb-0 mt-2 text-sm leading-relaxed text-muted sm:text-base">
            Organiza a tus personas especiales y guarda ideas de regalo para ellas.
          </p>
        </header>
        <form
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();

            setErrorMessage("");

            const formData = new FormData(event.currentTarget);

            if (formData.get("password") !== formData.get("confirmpassword")) {
              setErrorMessage("Las contraseñas no coinciden.");
              return;
            }

            setIsLoading(true);

            try {
              const response = await fetch("/api/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: formData.get("name"),
                  email: formData.get("email"),
                  password: formData.get("password"),
                }),
              });

              if (response.ok) {
                // App sends the user to Login with the success message
                onRegister();
              } else if (response.status === 409) {
                setErrorMessage("Ya existe una cuenta con ese email.");
              } else if (response.status === 400) {
                setErrorMessage(
                  "Revisa el nombre, el email y la contraseña. Esta debe tener entre 8 y 20 caracteres, mayúscula, minúscula, número y símbolo.",
                );
              } else {
                setErrorMessage("No se pudo completar el registro.");
              }
            } catch {
              setErrorMessage("No se pudo conectar con el servidor.");
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <Input id="name" name="name" label="Nombre" type="text" required />

          <Input id="email" name="email" label="Email" type="email" required />

          <Input
            id="password"
            name="password"
            label="Contraseña"
            type="password"
            minLength={8}
            maxLength={20}
            required
          />
          <Input
            id="confirmpassword"
            name="confirmpassword"
            label="Confirmar contraseña"
            type="password"
            minLength={8}
            maxLength={20}
            required
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="min-h-12 w-full text-base font-semibold shadow-sm shadow-primary/10"
          >
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
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

export default RegisterPage;
