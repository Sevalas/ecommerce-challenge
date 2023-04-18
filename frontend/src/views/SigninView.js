import { Container, Form, Button, Modal } from "react-bootstrap";
import apiClient from "../components/ApiClient";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store } from "../context/Store";
import toast from "react-hot-toast";
import { getError, validMailPassRegex } from "../utils/utils";
import EmailField from "../components/EmailField";
import PasswordField from "../components/PasswordField";

export default function SigninView() {
  const navigateTo = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";
  const { state, dispatch: contextDispatch } = useContext(Store);
  const { userInfo } = state;
  const [showForgetPasswordModal, setShowForgetPasswordModal] = useState(false);
  const [form, setForm] = useState({
    password: "",
    email: "",
  });
  const [errorsForm, setErrorsForm] = useState({});
  const [forgetPasswordEmail, setForgetPasswordEmail] = useState("");

  const handleCloseForgetPasswordModal = () =>
    setShowForgetPasswordModal(false);

  const handleShowForgetPasswordModal = () => setShowForgetPasswordModal(true);

  const setField = (field, value) => {
    setForm({ ...form, [field]: value });
    if (!!errorsForm[field]) {
      setErrorsForm({ ...errorsForm, [field]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    validMailPassRegex(
      newErrors,
      form.email,
      "email",
      form.password,
      "password"
    );
    return newErrors;
  };

  useEffect(() => {
    if (userInfo) {
      navigateTo(redirect);
    }
  }, [navigateTo, redirect, userInfo]);

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      const formErrors = validateForm();
      if (Object.keys(formErrors).length > 0) {
        setErrorsForm(formErrors);
        return;
      }
      const { data } = await apiClient.post("/api/users/signin", {
        email: form.email,
        password: form.password,
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
        <EmailField
          value={form[(event) => event.target.id]}
          onChange={(event) => setField(event.target.id, event.target.value)}
          error={errorsForm.email}
          spacing="mb-3"
          required
        />
        <PasswordField
          value={form.password}
          onChange={(event) => setField(event.target.id, event.target.value)}
          error={errorsForm.password}
          spacing="mb-3"
          required
        />
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
            Enter your recovery email
            <Form.Group className="my-3" controlId="forgetPasswordEmail">
              <Form.Control
                placeholder="Type your email"
                id="forgetPasswordEmail"
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
