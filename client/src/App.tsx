import { BrowserRouter, Route, Routes } from "react-router-dom";
import Page404 from "./pages/Page404";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Add your routes here */}
        <Route path="/" element={<Home />} />

        {/* Add a catch-all route */}
        <Route path="*" element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
