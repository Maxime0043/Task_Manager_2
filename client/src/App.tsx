import { BrowserRouter, Route, Routes } from "react-router-dom";
import Page404 from "./pages/Page404";
import Home from "./pages/Home";
import Signin from "./pages/Signin";
import AuthGuard from "./components/AuthGuard";

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
