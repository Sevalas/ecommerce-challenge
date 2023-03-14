import { Container, Form, Button, Modal } from "react-bootstrap";
import apiClient from "../components/ApiClient";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store } from "../context/Store";
import toast from "react-hot-toast";
import { getError } from "../utils/utils";

export default function SigninView() {
  const navigateTo = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";
  const { state, dispatch: contextDispatch } = useContext(Store);
  const { userInfo } = state;
  const [showForgetPasswordModal, setShowForgetPasswordModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgetPasswordEmail, setForgetPasswordEmail] = useState("");

  const handleCloseForgetPasswordModal = () =>
    setShowForgetPasswordModal(false);

  const handleShowForgetPasswordModal = () => setShowForgetPasswordModal(true);

  useEffect(() => {
    if (userInfo) {
      navigateTo(redirect);
    }
  }, [navigateTo, redirect, userInfo]);

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      const { data } = await apiClient.post("/api/users/signin", {
        email: email,
        password: password,
      });
      contextDispatch({ type: "USER_SIGNIN", payload: data });
      navigateTo(redirect || "/");
    } catch (error) {
      toast.error(getError(error), {
        toastId: getError(error),
      });
    }
  };

  const submitForgetPasswordHandler = async (event) => {
    event.preventDefault();
    const forgetPassword = async () => {
      return await apiClient.post("/api/users/forget-password", {
        email: forgetPasswordEmail,
      });
    };

    await toast.promise(forgetPassword(), {
      loading: "Loading...",
      success: (response) => {
        handleCloseForgetPasswordModal();
        return response.data.message;
      },
      error: (error) => `Error: ${getError(error)}`,
    });
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign In</title>
      </Helmet>
      <h1 className="my-3">Sign In</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Sign in</Button>
        </div>
        <div className="mb-2">
          New customer?{"  "}
          <Link to={`/signup?redirect=${redirect}`}>Create your account</Link>
        </div>
        <div className="mb-3">
          Forget Password?{"  "}
          <Link onClick={handleShowForgetPasswordModal}>Reset Password</Link>
        </div>
      </Form>

      <Modal
        show={showForgetPasswordModal}
        onHide={handleCloseForgetPasswordModal}
        size="md"
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Forget Password</Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitForgetPasswordHandler}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="forgetPasswordEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                onChange={(event) => setForgetPasswordEmail(event.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit">Submit</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseForgetPasswordModal}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
