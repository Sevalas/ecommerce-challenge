import "./App.css";
import { useEffect, useContext, useState } from "react";
import { Store } from "./context/Store";
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
import SearchView from "./views/SearchView";

export default function App() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [sideBarIsOpen, setSideBarIsOpen] = useState(false);

  const location = useLocation();
  useEffect(() => {
    toast.dismiss();
  }, [location]);

  return (
    <div
      className={
        sideBarIsOpen
          ? "site-container active-cont d-flex flex-column"
          : "site-container d-flex flex-column"
      }
    >
      <Toaster position="bottom-center" />
      <NavbarView sideBarState={{ sideBarIsOpen, setSideBarIsOpen }} />
      <main className="bg-light pb-2">
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
            <Route path="/search" element={<SearchView />} />
            <Route path="*" element={<h1 className="text-center mt-5">404 PAGE NOT FOUND :C</h1>} />
          </Routes>
        </Container>
      </main>
      {userInfo && userInfo.email === "nvidalsaunero11@gmail.com" && (
        <div className="d-flex flex-column justify-content-center">
          <h2 className="text-center">{"Te amo pelotua!!! <3"}</h2>
          <img
            className="mx-auto w-25"
            src="https://thumbs.gfycat.com/IllustriousAstonishingIrrawaddydolphin-size_restricted.gif"
            alt="gif"
          />
        </div>
      )}
      <FooterView />
    </div>
  );
}
