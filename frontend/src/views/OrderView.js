import apiClient from "../components/ApiClient";
import { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, ListGroup, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../context/Store";
import { getError } from "../utils/utils";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import toast from "react-hot-toast";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "PAY_REQUEST":
      return { ...state, loadingPay: true };
    case "PAY_SUCCESS":
      return { ...state, loadingPay: false, successPay: true };
    case "PAY_FAIL":
      return { ...state, loadingPay: false };
    case "PAY_RESET":
      return { ...state, loadingPay: false, successPay: false };
    case "DELIVER_REQUEST":
      return { ...state, loadingDeliver: true };
    case "DELIVER_SUCCESS":
      return { ...state, loadingDeliver: false, successDeliver: true };
    case "DELIVER_FAIL":
      return { ...state, loadingDeliver: false, errorDeliver: action.payload };
    case "DELIVER_RESET":
      return { ...state, loadingDeliver: false, successDeliver: false };
    default:
      return state;
  }
}
export default function OrderView() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const params = useParams();
  const { id: orderId } = params;
  const navigateTo = useNavigate();

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: "",
    successPay: false,
    loadingPay: false,
  });

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }
  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: "PAY_REQUEST" });
        const { data } = await apiClient.put(
          `/api/orders/${order._id}/pay`,
          details
        );
        dispatch({ type: "PAY_SUCCESS", payload: data });
        toast.success("Order is paid");
      } catch (err) {
        dispatch({ type: "PAY_FAIL", payload: getError(err) });
        toast.error(getError(error), {
          toastId: getError(error),
        });
      }
    });
  }
  function onError(err) {
    toast.error(getError(err), { toastId: getError(error) });
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await apiClient.get(`/api/orders/${orderId}`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigateTo(`/signin?redirect=/order/${orderId}`);
    }
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: "PAY_RESET" });
      }
      if (successDeliver) {
        dispatch({ type: "DELIVER_RESET" });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await apiClient.get("/api/keys/paypal");
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": clientId,
            currency: "USD",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };
      loadPaypalScript();
    }
  }, [
    order,
    userInfo,
    orderId,
    navigateTo,
    paypalDispatch,
    successPay,
    successDeliver,
  ]);

  const deliverOrderHandler = async () => {
    try {
      dispatch({ type: "DELIVER_REQUEST" });
      await apiClient.put(`/api/orders/${orderId}/deliver`, {});
      dispatch({ type: "DELIVER_SUCCESS" });
      toast.success("Order is delivered");
    } catch (error) {
      toast.error(getError(error));
      dispatch({ type: "DELIVER_FAIL" });
    }
  };

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>
      <h1 className="my-3">Order {orderId}</h1>
      <Row>
        <Col md={7}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {order.shippingAddress.fullName}
                <br />
                <strong>Address: </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.postalCode},{" "}
                {order.shippingAddress.country}
                <br />
                <strong>Status: </strong>
                {order.status.isDelivered && order.status.deliveredAt
                  ? `Delivered at: ${order.status.deliveredAt.substring(0, 10)}`
                  : "Not Delivered"}
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method:</strong>{" "}
                <span className="text-capitalize">{order.paymentMethod}</span>
                <br />
                <strong>Status: </strong>
                {order.status.isPaid && order.status.paidAt
                  ? `Paid at: ${order.status.paidAt.substring(0, 10)}`
                  : "Not Paid"}
              </Card.Text>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {!order.orderItems || order.orderItems.length === 0 ? (
                  <MessageBox variant="danger">Order Without items</MessageBox>
                ) : (
                  order.orderItems.map((item) => (
                    <ListGroup.Item key={item._id}>
                      <Row className="align-items-center">
                        <Col md={6} className="text-center">
                          <img
                            src={item.image}
                            alt="item.name"
                            className="rounded img-thumbnail-cart-view"
                          />
                          <div>
                            <Link to={`/product/${item.slug}`}>
                              {item.name}
                            </Link>
                          </div>
                        </Col>
                        <Col className="text-center">
                          <h5 className="my-2">${item.price}</h5>
                        </Col>
                        <Col md={2} className="text-center">
                          <span>x{item.quantity}</span>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>${order.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>${order.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${order.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>${order.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                  {!order.status.isPaid &&
                    (isPending ? (
                      <LoadingBox />
                    ) : (
                      <PayPalButtons
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onError={onError}
                        className="mt-3"
                      />
                    ))}
                  {loadingPay && <LoadingBox />}
                </ListGroup.Item>
                {userInfo.isAdmin &&
                  order.status.isPaid &&
                  !order.status.isDelivered && (
                    <ListGroup.Item>
                      {loadingDeliver && <LoadingBox />}
                      <div className="d-grid">
                        <Button type="button" onClick={deliverOrderHandler}>
                          Deliver Order
                        </Button>
                      </div>
                    </ListGroup.Item>
                  )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
