import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomeView from "./views/HomeView";
import ProductView from "./views/ProductView";
import Container from "react-bootstrap/Container";
import NavbarView from "./views/NavbarView";
import FooterView from "./views/FooterView";
import CartView from "./views/CartView";

function App() {
  return (
    <BrowserRouter>
      <NavbarView></NavbarView>

      <div className="d-flex flex-column site-container">
        <main>
          <Container className="mt-3">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/product/:slug" element={<ProductView />} />
              <Route path="/cart" element={<CartView />} />
            </Routes>
          </Container>
        </main>

        <FooterView></FooterView>
      </div>
    </BrowserRouter>
  );
}

export default App;
