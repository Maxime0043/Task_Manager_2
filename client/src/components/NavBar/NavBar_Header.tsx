import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { signoutUser } from "../../app/actions/authActions";
import { NavLink } from "react-router-dom";

function NavBar_Header() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();

  function signout() {
    dispatch(signoutUser());
  }

  return (
    <div id="navigation-header">
      <img
        src={
          user.icon || "https://www.svgrepo.com/show/415663/basic-help-ui.svg"
        }
        id="navigation-header-logo"
        alt="Logo"
        height={50}
      />

      <p id="navigation-header-user">
        {user.firstName} {user.lastName?.toUpperCase()}
      </p>

      <div id="navigation-header-extra">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "navigation-active" : "")}
        >
          <img
            src="https://www.svgrepo.com/show/526221/settings.svg"
            alt="Options"
            height={30}
          />
        </NavLink>
        <button id="navigation-header-signout" onClick={signout}>
          <img
            src="https://www.svgrepo.com/show/507358/logout.svg"
            alt="Se déconnecter"
            height={30}
          />
        </button>
      </div>
    </div>
  );
}

export default NavBar_Header;
