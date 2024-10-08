import { NavLink } from "react-router-dom";
import { BiSolidDashboard, BiSolidInbox, BiTask } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";
import { PiProjectorScreenLight } from "react-icons/pi";

function NavBar_Links() {
  const links = [
    { name: "Dashboard", url: "/", icon: BiSolidDashboard },
    { name: "Messagerie", url: "/inbox", icon: BiSolidInbox },
    { name: "Clients", url: "/clients", icon: FaUsers },
    { name: "Projets", url: "/projects", icon: PiProjectorScreenLight },
    { name: "Tâches", url: "/tasks", icon: BiTask },
  ];

  return (
    <div id="navigation-links">
      {links.map((link, index) => {
        const Icon = link.icon;

        return (
          <NavLink
            key={index}
            to={link.url}
            className={({ isActive }) =>
              isActive ? "navigation-active navigation-link" : "navigation-link"
            }
          >
            <Icon className="navigation-link-icon" />
            <span className="navigation-link-text">{link.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
}

export default NavBar_Links;
