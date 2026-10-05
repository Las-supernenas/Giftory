function LoginPage() {
  return (
    <main>
      <h1>Iniciar sesión</h1>
      <form>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />

        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" />

        <button type="submit">Iniciar sesión</button>
      </form>
    </main>
  );
}

export default LoginPage;
