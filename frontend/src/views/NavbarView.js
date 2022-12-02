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
    <div className="sticky-top">
      <Navbar bg="dark" variant="dark" expand="md" collapseOnSelect>
        <Container>
          <div className="flex-grow-1">
            <LinkContainer to="/">
              <Navbar.Brand>Ecommers</Navbar.Brand>
            </LinkContainer>
          </div>
          <Nav>
            <Link to="/cart" className="nav-link">
              Cart
              {cart.cartItems.length > 0 && (
                <Badge pill bg="danger" className="ms-1">
                  {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                </Badge>
              )}
            </Link>
          </Nav>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" className="mx-3"/>
          <Navbar.Collapse
            id="responsive-navbar-nav"
            className="flex-grow-0"
          >
            <Nav className=" justify-content-end">
              {userInfo ? (
                <NavDropdown
                  title={userInfo.name}
                  id="basic-nav-dropdown"
                  className="text-end"
                  align="end"
                >
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
    </div>
  );
}
