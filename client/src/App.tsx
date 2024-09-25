import { BrowserRouter, Route, Routes } from "react-router-dom";
import Page404 from "./pages/Page404";
import Home from "./pages/Home";
import Signin from "./pages/Signin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Add your routes here */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />

        {/* Add a catch-all route */}
        <Route path="*" element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
