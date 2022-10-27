import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import { LinkContainer } from "react-router-bootstrap";

function NavbarView() {
  return (
    <Navbar bg="dark" variant="dark" className="sticky-top">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Ecommers</Navbar.Brand>
        </LinkContainer>
      </Container>
    </Navbar>
  );
}

export default NavbarView;
