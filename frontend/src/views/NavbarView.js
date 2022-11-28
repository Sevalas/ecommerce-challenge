import { Navbar, Nav, Badge, Container, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useContext } from "react";
import { Store } from "../context/Store";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";

export default function NavbarView() {
  const { state, dispatch: contextDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const signOutHandler = () => {
    contextDispatch({ type: "USER_SIGNOUT" });
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="md" className="sticky-top">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>Ecommers</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto w-100 justify-content-end">
              <Link to="/cart" className="nav-link text-end" >
                Cart
                {cart.cartItems.length > 0 && (
                  <Badge pill bg="danger" className="ms-1">
                    {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                  </Badge>
                )}
              </Link>
              {userInfo ? (
                <NavDropdown title={userInfo.name} id="basic-nav-dropdown" className="text-end"> 
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>User Profile</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/orderhistory">
                    <NavDropdown.Item>Order History</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <Link
                    className="dropdown-item"
                    to="/"
                    onClick={signOutHandler}
                  >
                    Sign Out
                  </Link>
                </NavDropdown>
              ) : (
                <Link className="nav-link" to="/signin">
                  Sign In
                </Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <TopBar />
    </>
  );
}
