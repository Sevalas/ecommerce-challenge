import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomeView from "./views/HomeView";
import ProductView from "./views/ProductView";
import Container from "react-bootstrap/Container";
import NavbarView from "./views/NavbarView";
import FooterView from "./views/FooterView";
import CartView from "./views/CartView";
import SigninView from "./views/SigninView";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShippingAddressView from "./views/ShippingAddressView";
import SignupView from "./views/SignupView";

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column site-container">
        <ToastContainer position="bottom-center" limit={1} />
        <NavbarView />
        <main>
          <Container className="mt-3">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/product/:slug" element={<ProductView />} />
              <Route path="/cart" element={<CartView />} />
              <Route path="/signin" element={<SigninView />} />
              <Route path="/signup" element={<SignupView />} />
              <Route path="/shipping" element={<ShippingAddressView />} />
            </Routes>
          </Container>
        </main>

        <FooterView />
      </div>
    </BrowserRouter>
  );
}

export default App;
