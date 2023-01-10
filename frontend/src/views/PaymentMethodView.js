import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useContext, useEffect } from "react";
import { Store } from "../context/Store";
import toast from 'react-hot-toast';
import { getError } from "../utils/utils";
import CheckoutSteps from "../components/CheckoutSteps.js";

export default function PaymentMethodView() {
  const navigateTo = useNavigate();
  const { state, dispatch: contextDispatch } = useContext(Store);
  const {
    cart: { shippingAddress, paymentMethod },
  } = state;
  const [paymentMethodName, setPaymentMethodName] = useState(
    paymentMethod || "paypal"
  );

  useEffect(() => {
    if (!shippingAddress.address1) {
      navigateTo("/shipping");
    }
  }, [shippingAddress, navigateTo]);

  const submitHandler = async (event) => {
    event.preventDefault();

    try {
      contextDispatch({
        type: "SAVE_PAYMENT_METHOD",
        payload: paymentMethodName,
      });
      navigateTo("/placeorder");
    } catch (error) {
      toast.error(getError(error), {
        toastId: getError(error),
      });
    }
  };

  return (
    <div>
      <CheckoutSteps step1 step2 step3 />
      <div className="container small-container">
        <Helmet>
          <title>Payment Method {paymentMethodName}</title>
        </Helmet>
        <h1 className="my-3">Payment Method</h1>
        <Form onSubmit={submitHandler}>
          <div className="mb-3">
            <Form.Check
              type="radio"
              id="Paypal"
              label="Paypal"
              value="paypal"
              checked={paymentMethodName === "paypal"}
              onChange={(event) => setPaymentMethodName(event.target.value)}
            />
            <Form.Check
              type="radio"
              id="Stripe"
              label="Stripe"
              value="stripe"
              checked={paymentMethodName === "stripe"}
              onChange={(event) => setPaymentMethodName(event.target.value)}
            />
          </div>
          <div className="mb-3">
            <Button type="submit">Continue</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
