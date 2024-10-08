import { useId } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import { signinUser } from "../app/actions/authActions";

import logo from "../assets/logo-1.svg";

interface DataType extends FieldValues {
  email: string;
  password: string;
}

function Signin() {
  const { error, success } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();
  const { register: signin, handleSubmit } = useForm<DataType>();
  const emailId = useId();
  const passwordId = useId();

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
    <div id="ctn-signin">
      <img src={logo} id="signin-logo" alt="Logo" />

      <div id="signin-box">
        <h1>Se Connecter</h1>

        <ul
          className={
            "form-messages" + (error || success ? "" : "form-messages-hidden")
          }
        >
          {error && (
            <li className="form-message-error">
              Votre email ou mot de passe est incorrect!
            </li>
          )}
          {success && (
            <li className="form-message-success">Vous êtes connecté!</li>
          )}
        </ul>

        <form id="signin-form" onSubmit={handleSubmit(handleSignin)}>
          <div>
            <label htmlFor={emailId}>Email:</label>
            <input type="email" id={emailId} {...signin("email")} />
          </div>

          <div>
            <label htmlFor={passwordId}>Mot de passe:</label>
            <input type="password" id={passwordId} {...signin("password")} />
          </div>

          <button type="submit">Connexion</button>
        </form>
      </div>
    </div>
  );
}

export default Signin;
