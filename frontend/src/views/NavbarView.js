import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Navbar";
import Badge from "react-bootstrap/Badge";
import Container from "react-bootstrap/Container";
import { LinkContainer } from "react-router-bootstrap";
import { useContext } from "react";
import { Store } from "../context/Store"
import { Link } from "react-router-dom";

function NavbarView() {
  const { state } = useContext(Store);
  const { cart } = state;

  return (
    <Navbar bg="dark" variant="dark" className="sticky-top">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Ecommers</Navbar.Brand>
        </LinkContainer>
        <Nav className="me-auto text-light">
          <Link to="/cart" className="nav-link">
            Cart
            {cart.cartItems.length > 0 && (
              <Badge pill bg="danger">
                {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
              </Badge>
            )}
          </Link>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavbarView;
