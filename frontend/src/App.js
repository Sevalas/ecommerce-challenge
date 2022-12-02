import "./App.css";
import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import HomeView from "./views/HomeView";
import ProductView from "./views/ProductView";
import { Container } from "react-bootstrap";
import NavbarView from "./views/NavbarView";
import FooterView from "./views/FooterView";
import CartView from "./views/CartView";
import SigninView from "./views/SigninView";
import toast, { Toaster } from "react-hot-toast";
import ShippingAddressView from "./views/ShippingAddressView";
import SignupView from "./views/SignupView";
import PaymentMethodView from "./views/PaymentMethodView";
import PlaceOrderView from "./views/PlaceOrderView";
import OrderView from "./views/OrderView";
import OrderHistoryView from "./views/OrderHistoryView";
import ProfileView from "./views/ProfileView";

export default function App() {
  const location = useLocation();
  useEffect(() => {
    toast.dismiss();
  }, [location]);

  return (
    <div className="d-flex flex-column site-container">
      <Toaster position="bottom-center" />
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
            <Route path="/profile" element={<ProfileView />} />
            <Route path="*" element={<HomeView />} />
          </Routes>
        </Container>
      </main>

      <FooterView />
    </div>
  );
}
