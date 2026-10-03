import { useState } from "react";

function RegisterPage() {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main>
      <h1>Crear cuenta</h1>

      <form
        onSubmit={async (event) => {
          event.preventDefault();

          setSuccessMessage("");
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
              setSuccessMessage("Cuenta creada correctamente.");
            } else if (response.status === 409) {
              setErrorMessage("Ya existe una cuenta con ese email.");
            } else if (response.status === 400) {
              setErrorMessage(
                "Revisa los datos. La contraseña debe tener entre 8 y 20 caracteres, mayúscula, minúscula, número y símbolo.",
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
        <label htmlFor="name">Nombre</label>
        <input id="name" name="name" type="text" required />

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          maxLength={20}
          required
        />
        <label htmlFor="confirmpassword">Confirmar Contraseña</label>
        <input
          id="confirmpassword"
          name="confirmpassword"
          type="password"
          minLength={8}
          maxLength={20}
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      {successMessage && <p role="status">{successMessage}</p>}
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </main>
  );
}

export default RegisterPage;
