import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { signoutUser } from "../../app/actions/authActions";
import { NavLink } from "react-router-dom";

import { FaCircleUser } from "react-icons/fa6";
import { RiSettings4Fill } from "react-icons/ri";
import { IoLogOut } from "react-icons/io5";

function NavBar_Header() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();

  function signout() {
    dispatch(signoutUser());
  }

  return (
    <div id="navigation-header">
      {user.icon ? (
        <img
          src={user.icon}
          id="navigation-header-logo"
          alt="Logo"
          height={50}
        />
      ) : (
        <FaCircleUser id="navigation-header-logo" />
      )}

      <p id="navigation-header-user">
        {user.firstName} {user.lastName?.toUpperCase()}
      </p>

      <div id="navigation-header-extra">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "navigation-active" : "")}
          title="Options"
        >
          <RiSettings4Fill />
        </NavLink>
        <button id="navigation-header-signout" onClick={signout}>
          <IoLogOut title="Se déconnecter" />
        </button>
      </div>
    </div>
  );
}

export default NavBar_Header;
