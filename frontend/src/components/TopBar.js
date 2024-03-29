import {
  Navbar,
  Nav,
  Badge,
  Container,
  NavDropdown,
  Button,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useContext, useState, useEffect } from "react";
import { Store } from "../context/Store";
import { Link } from "react-router-dom";
import LoaderTopBar from "./LoaderTopBar";
import toast from "react-hot-toast";
import { getError } from "../utils/utils";
import SearchBox from "./SearchBox";
import apiClient from "./ApiClient";

export default function TopBar(props) {
  const { state, dispatch: contextDispatch } = useContext(Store);
  const { cart, userInfo } = state;
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await apiClient.get(`/api/products/categories`);
        setCategories(data);
      } catch (error) {
        toast.error(getError(error));
      }
    };
    fetchCategories();
  }, []);

  const signOutHandler = () => {
    contextDispatch({ type: "USER_SIGNOUT" });
  };

  return (
    <>
      <div
        className={
          props.sideBarState.sideBarIsOpen
            ? "active-nav bg-dark side-navbar d-flex justify-content-between flex-wrap flex-column"
            : "bg-dark side-navbar d-flex justify-content-between flex-wrap flex-column"
        }
      >
        <Nav className="flex-column text-white w-100 p-3">
          <Nav.Item>
            <strong>Categories</strong>
            {categories.map((category) => (
              <Nav.Item key={category}>
                <LinkContainer
                  to={{
                    pathname: "/search",
                    search: `?category=${category}`,
                  }}
                  onClick={() => props.sideBarState.setSideBarIsOpen(false)}
                >
                  <Nav.Link>{category}</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            ))}
          </Nav.Item>
        </Nav>
      </div>
      <div className="top-bar sticky-top ">
        <Navbar bg="dark" variant="dark" expand="md" collapseOnSelect>
          <Container className="justify-content-end">
            <div className="flex-grow-1 d-flex">
              <Button
                variant="dark"
                onClick={() =>
                  props.sideBarState.setSideBarIsOpen(
                    !props.sideBarState.sideBarIsOpen
                  )
                }
              >
                <i className="fas fa-bars" />
              </Button>
              <LinkContainer to="/">
                <Navbar.Brand>Ecommers</Navbar.Brand>
              </LinkContainer>
              <div className="search-box-navbar me-auto">
                <SearchBox />
              </div>
            </div>
            <Nav>
              <Link to="/cart" className="nav-link">
                <i className="fas fa-shopping-cart" />
                {cart.cartItems.length > 0 && (
                  <Badge pill bg="danger" className="ms-1">
                    {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                  </Badge>
                )}
              </Link>
            </Nav>
            <Navbar.Toggle
              aria-controls="responsive-navbar-nav"
              className="border-dark ms-2"
            >
              <i className="fas fa-bars" />
            </Navbar.Toggle>
            <Navbar.Collapse id="responsive-navbar-nav" className="flex-grow-0">
              <Nav className="justify-content-end">
                <NavDropdown
                  title={<i className="fa-solid fa-user"></i>}
                  id="dropdown-menu-align-end"
                  className="custom-nav-dropdown text-center"
                  renderMenuOnMount="true"
                  align="end"
                  menuVariant="dark"
                >
                  {userInfo ? (
                    <>
                      <div className="text-start text-capitalize px-3">
                        <h5>{userInfo.name}</h5>
                      </div>
                      <NavDropdown.Divider />
                      <div className="search-box-dropdown px-3 py-2">
                        <SearchBox />
                      </div>
                      <NavDropdown.Divider className="search-box-dropdown" />
                      <LinkContainer to="/profile" className="text-center">
                        <NavDropdown.Item>User Profile</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/orderhistory" className="text-center">
                        <NavDropdown.Item>Order History</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <LinkContainer
                        to="/"
                        onClick={signOutHandler}
                        className="text-center"
                      >
                        <NavDropdown.Item>Sign Out</NavDropdown.Item>
                      </LinkContainer>
                    </>
                  ) : (
                    <>
                      <div className="search-box-dropdown px-3 py-2">
                        <SearchBox />
                      </div>
                      <NavDropdown.Divider className="search-box-dropdown" />
                      <LinkContainer to="/signin" className="text-center">
                        <NavDropdown.Item>Sign In</NavDropdown.Item>
                      </LinkContainer>
                    </>
                  )}
                </NavDropdown>
                {userInfo && userInfo.isAdmin && (
                  <NavDropdown
                    title={<i className="fa-solid fa-user-gear"></i>}
                    id="admin-nav-dropdown"
                    className="custom-nav-dropdown text-center"
                    renderMenuOnMount="true"
                    align="end"
                    menuVariant="dark"
                  >
                    <div className="text-start text-capitalize px-3">
                      <h5>Admin Area</h5>
                    </div>
                    <LinkContainer to="/admin/dashboard" className="text-center">
                      <NavDropdown.Item>Dashboard</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/products" className="text-center">
                      <NavDropdown.Item>Products</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/orders" className="text-center">
                      <NavDropdown.Item>Orders</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/users" className="text-center">
                      <NavDropdown.Item>Users</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/support" className="text-center">
                      <NavDropdown.Item>Support</NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <LoaderTopBar />
      </div>
    </>
  );
}
