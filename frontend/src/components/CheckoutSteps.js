import React from "react";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function CheckoutSteps(props) {
  return (
    <Row className="checkout-steps">
      <Link className={props.step1 ? "signin-step-active" : ""} >Sign-In</Link>
      <Link className={props.step2 ? "active" : ""} to={"/shipping"}>Shipping</Link>
      <Link className={props.step3 ? "active" : ""} to={"/payment"}>Payment</Link>
      <Link className={props.step4 ? "active" : ""} to={"/placeorder"}>Place Order</Link>
    </Row>
  );
}
