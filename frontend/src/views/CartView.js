import { useContext } from "react";
import { Helmet } from "react-helmet-async";
import { Store } from "../context/Store";
import { Row, Col, ListGroup, Button, Card}  from "react-bootstrap";
import MessageBox from "../components/MessageBox";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../components/ApiClient";

export default function CartView() {
  const { state, dispatch: contextDispatch } = useContext(Store);
  const {
    userInfo,
    cart: { cartItems },
  } = state;
  const navigateTo = useNavigate();

  const updateCartHandler = async (item, quantity) => {
    const { data } = await apiClient.get(`/api/products/${item._id}`);
    if (data.countInStock >= quantity) {
      contextDispatch({
        type: "CART_ADD_ITEM",
        payload: { ...item, quantity },
      });
    }
  };

  const removeCartHandler = (item) => {
    contextDispatch({
      type: "CART_REMOVE_ITEM",
      payload: { ...item },
    });
  };

  const checkoutHandler = () => {
    if (userInfo) {
      navigateTo("/shipping");
    } else {
      navigateTo("/signin?redirect=/shipping");
    }
  };

  return (
    <div>
      <Helmet>
        <title>Shopping Cart</title>
      </Helmet>
      <h1>Shopping Cart</h1>
      <Row>
        <Col md={8}>
          {cartItems.length === 0 ? (
            <MessageBox>
              Empty Cart. <Link to="/">Go Shopping</Link>
            </MessageBox>
          ) : (
            <ListGroup>
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className="align-items-center">
                    <Col md="4" className="text-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="rounded img-thumbnail-cart-view"
                      />
                      {"  "}
                      <div>
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </div>
                    </Col>
                    <Col className="text-center">
                      <h5 className="my-2">${item.price}</h5>
                    </Col>
                    <Col md="4" className="text-center">
                      <Button
                        variant="light"
                        disabled={item.quantity === 1}
                        onClick={() =>
                          updateCartHandler(item, item.quantity - 1)
                        }
                      >
                        <i className="fas fa-minus-circle"></i>
                      </Button>
                      {"  "}
                      <span>x{item.quantity}</span>
                      {"  "}
                      <Button
                        variant="light"
                        disabled={item.quantity === item.countInStock}
                        onClick={() =>
                          updateCartHandler(item, item.quantity + 1)
                        }
                      >
                        <i className="fas fa-plus-circle"></i>
                      </Button>
                      <Button
                        variant="light"
                        onClick={() => removeCartHandler(item)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>
                    Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)})
                    {"  "}
                    items
                  </h3>
                  <h3>
                    : ${cartItems.reduce((a, c) => a + c.price * c.quantity, 0)}
                  </h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={cartItems.length === 0}
                    onClick={() => checkoutHandler()}
                  >
                    Proceed to Checkout
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
