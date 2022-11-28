import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomeView from "./views/HomeView";
import ProductView from "./views/ProductView";
import { Container } from "react-bootstrap";
import NavbarView from "./views/NavbarView";
import FooterView from "./views/FooterView";
import CartView from "./views/CartView";
import SigninView from "./views/SigninView";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShippingAddressView from "./views/ShippingAddressView";
import SignupView from "./views/SignupView";
import PaymentMethodView from "./views/PaymentMethodView";
import PlaceOrderView from "./views/PlaceOrderView";
import OrderView from "./views/OrderView";
import OrderHistoryView from "./views/OrderHistoryView";

export default function App() {
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
              <Route path="/payment" element={<PaymentMethodView />} />
              <Route path="/placeorder" element={<PlaceOrderView />} />
              <Route path="/order/:id" element={<OrderView />} />
              <Route path="/orderhistory" element={<OrderHistoryView />} />
              <Route path="*" element={<HomeView />} />
            </Routes>
          </Container>
        </main>

        <FooterView />
      </div>
    </BrowserRouter>
  );
}
