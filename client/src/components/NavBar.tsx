import NavBar_Body from "./NavBar/NavBar_Body";
import NavBar_Header from "./NavBar/NavBar_Header";
import NavBar_Footer from "./NavBar/NavBar_Footer";

function NavBar() {
  return (
    <div id="ctn-navigation">
      <NavBar_Header />
      <NavBar_Body />
      <NavBar_Footer />
    </div>
  );
}

export default NavBar;
