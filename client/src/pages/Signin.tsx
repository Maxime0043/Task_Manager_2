import { FieldValues, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import { signinUser } from "../app/actions/authActions";

interface DataType extends FieldValues {
  email: string;
  password: string;
}

function Signin() {
  const { error, success } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();
  const { register: signin, handleSubmit } = useForm<DataType>();

  function handleSignin(data: DataType) {
    // Validate data here
    if (!data.email || !data.password) {
      window.alert("Veuillez remplir tous les champs!");
      return;
    }

    // Set email in lowercase
    data.email = data.email.toLowerCase();

    dispatch(signinUser(data));
  }

  return (
    <div>
      <h1>Se Connecter</h1>

      {success && <p>Vous êtes connecté!</p>}
      {error && <p>Email ou mot de passe incorrect!</p>}

      <form onSubmit={handleSubmit(handleSignin)}>
        <label>
          Email:
          <input type="email" {...signin("email")} />
        </label>

        <label>
          Mot de passe:
          <input type="password" {...signin("password")} />
        </label>

        <button type="submit">Connexion</button>
      </form>
    </div>
  );
}

export default Signin;
