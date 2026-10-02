function RegisterPage() {
  return (
    <main>
      <h1>Crear cuenta</h1>

      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label htmlFor="name">Nombre</label>
        <input id="name" name="name" type="text" required />

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" required />

        <button type="submit">Crear cuenta</button>
      </form>
    </main>
  );
}

export default RegisterPage;
