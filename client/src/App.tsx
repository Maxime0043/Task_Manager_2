import { BrowserRouter, Route, Routes } from "react-router-dom";
import Page404 from "./pages/Page404";
import Home from "./pages/Home";
import Signin from "./pages/Signin";
import AuthGuard from "./components/AuthGuard";
import NavBar from "./components/NavBar";

function App() {
  return (
    <BrowserRouter>
      <div id="ctn-task-manager">
        <NavBar />

        <div id="ctn-view">
          <Routes>
            {/* Add your routes here */}
            <Route
              path="/"
              element={<AuthGuard Element={Home} verification={true} />}
            />
            <Route
              path="/signin"
              element={
                <AuthGuard
                  Element={Signin}
                  verification={false}
                  needToBeLoggedOut={true}
                />
              }
            />

            {/* Add a catch-all route */}
            <Route path="*" element={<Page404 />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
