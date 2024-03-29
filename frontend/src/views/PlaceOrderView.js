import { useNavigate } from "react-router-dom";
import { useEffect, useContext, useReducer, useState } from "react";
import { Button, Row, Col, Card, ListGroup } from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import { Store } from "../context/Store";
import CheckoutSteps from "../components/CheckoutSteps.js";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getError } from "../utils/utils";
import apiClient from "../components/ApiClient";
import LoadingBox from "../components/LoadingBox";
import GoogleMapModal from "../components/GoogleMapModal";

const reducer = (state, action) => {
  switch (action.type) {
    case "CREATE_REQUEST":
      return { ...state, loading: true };
    case "CREATE_SUCCESS":
      return { ...state, loading: false };
    case "CREATE_FAIL":
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function PlaceOrderView() {
  const navigateTo = useNavigate();

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });
  const { state, dispatch: contextDispatch } = useContext(Store);
  const { cart } = state;
  const [showMapModal, setShowMapModal] = useState(false);
  const handleShowMapModal = () => setShowMapModal(true);
  const handleCloseMapModal = () => setShowMapModal(false);

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
  cart.taxPrice = round2(0.15 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

  const placeOrderHandler = async () => {
    try {
      dispatch({ type: "CREATE_REQUEST" });
      const { data } = await apiClient.post("/api/orders", {
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      });
      contextDispatch({ type: "CART_CLEAR" });
      dispatch({ type: "CREATE_SUCCESS" });
      navigateTo(`/order/${data.order._id}`);
    } catch (error) {
      dispatch({ type: "CREATE_FAIL" });
      toast.error(getError(error), {
        toastId: getError(error),
      });
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigateTo("/payment");
    }
  }, [cart, navigateTo]);

  const addressFormater = () => {
    const listOfAddressKeys = [
      "address1",
      "address2",
      "province",
      "city",
      "country",
      "postalCode",
    ];
    let address = "";
    if (cart.shippingAddress) {
      listOfAddressKeys.forEach((key) => {
        let item = cart.shippingAddress[key];
        if (item != null && item !== "") {
          address = address.concat(item, ", ");
        }
      });
    }
    return address.substring(0, address.lastIndexOf(", "));
  };

  return (
    <div>
      <Helmet>
        <title>Preview Order</title>
      </Helmet>
      {loading && <LoadingBox />}
      <CheckoutSteps step1 step2 step3 step4 />
      <h1 className="my-3">Preview Order</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {cart.shippingAddress.fullName} <br />
                <strong>Address: </strong>
                {addressFormater()}
                {cart.shippingAddress.location && (
                  <>
                    {" "}
                    <Link onClick={handleShowMapModal}>Show on Map</Link>
                  </>
                )}
              </Card.Text>
              <Link to="/shipping">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method:</strong>{" "}
                <span className="text-capitalize">{cart.paymentMethod}</span>
              </Card.Text>
              <Link to="/payment">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {cart.cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6} className="text-center">
                        <img
                          src={item.coverImage}
                          alt="item.name"
                          className="rounded img-thumbnail-cart-view"
                        />
                        <div>
                          <Link to={`/product/${item.slug}`}>{item.name}</Link>
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
                ))}
              </ListGroup>
              <Link to="/cart">Edit</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>${cart.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>${cart.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${cart.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>${cart.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      onClick={placeOrderHandler}
                      disabled={cart.cartItems.length === 0}
                    >
                      Place Order
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {cart.shippingAddress.location && (
        <GoogleMapModal
          showMapModal={showMapModal}
          location={cart.shippingAddress.location}
          handleCloseMapModal={handleCloseMapModal}
        />
      )}
    </div>
  );
}
