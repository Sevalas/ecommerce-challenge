import { useReducer, useContext } from "react";
import { Helmet } from "react-helmet-async";
import { Store } from "../context/Store";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import MessageBox from "../components/MessageBox";
import { Link, useNavigate } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import axios from "axios";

function CartView() {
  const { state, dispatch: contextDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;
  const navigateTo = useNavigate();
  
  const updateCartHandler = async (item, quantity) => {
    const { data } = await axios.get(`/api/products/id/${item._id}`);
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
  }

  const checkoutHandler = () => {
    navigateTo("/signin?redirect/shipping");
  }

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
                    <Col md={4}>
                      <img
                        src={item.image}
                        alt="item.name"
                        className="img-fluid rounded img-thumbnail"
                      />
                      {"  "}
                      <Link to={`/product/${item.slug}`}>{item.name}</Link>
                    </Col>
                    <Col md={3}>
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
                      <span>{item.quantity}</span>
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
                    </Col>
                    <Col md={3}>${item.price}</Col>
                    <Col md={2}>
                      <Button
                        variant="light"
                        onClick={() =>
                          removeCartHandler(item)
                        }
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          ;
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>
                    Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)})
                    {"  "}
                    items : $
                    {cartItems.reduce((a, c) => a + c.price * c.quantity, 0)}
                  </h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={cartItems.length === 0}
                    onClick={() =>
                        checkoutHandler()
                      }
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

export default CartView;
