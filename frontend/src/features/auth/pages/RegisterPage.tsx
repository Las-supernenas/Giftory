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
    <main className="mx-auto max-w-md px-4 py-8 sm:py-12">
      <h1 className="mb-6 font-serif text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
        Crear cuenta
      </h1>
      <Card className="shadow-sm">
        <form
          className="space-y-4"
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

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
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

export default RegisterPage;
