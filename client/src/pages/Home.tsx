import { useDispatch } from "react-redux";
import { AppDispatch } from "../app/store";
import { signoutUser } from "../app/actions/authActions";

function Home() {
  const dispatch: AppDispatch = useDispatch();

  function signout() {
    dispatch(signoutUser());
  }

  return (
    <div>
      <h1>Task Manager</h1>

      <button onClick={signout}>Se déconnecter</button>
    </div>
  );
}

export default Home;
