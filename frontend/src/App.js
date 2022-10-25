import "./App.css";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import HomeView from "./views/HomeView";
import ProductView from "./views/ProductView";

function App() {
  return (
    <BrowserRouter>
      <div>
        <header>
          <Link to="/">Ecommers</Link>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/product/:slug" element={<ProductView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
