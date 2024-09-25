import { useState } from "react";

function Signin() {
  const [showError, setShowError] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowError(false);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/signin`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.status !== 200) {
          setShowError(true);
        }
      })
      .catch((error) => {
        console.error(error);
        setShowError(true);
      });
  }

  return (
    <div>
      <h1>Se Connecter</h1>

      {showError && <p>Email ou mot de passe incorrect!</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" name="email" />
        </label>

        <label>
          Mot de passe:
          <input type="password" name="password" />
        </label>

        <button type="submit">Connexion</button>
      </form>
    </div>
  );
}

export default Signin;
