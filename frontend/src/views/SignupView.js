import { Container, Form, Button } from "react-bootstrap";
import apiClient from "../components/ApiClient";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useContext, useEffect } from "react";
import { Store } from "../context/Store";
import toast from "react-hot-toast";
import { getError, validMailPassRegex } from "../utils/utils";
import PasswordField from "../components/PasswordField";
import EmailField from "../components/EmailField";

export default function SignupView() {
  const navigateTo = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";
  const { state, dispatch: contextDispatch } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    if (userInfo) {
      navigateTo(redirect);
    }
  }, [navigateTo, redirect, userInfo]);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorsForm, setErrorsForm] = useState({});

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
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords does not match";
    }

    return newErrors;
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrorsForm(formErrors);
      return;
    }
    try {
      const { data } = await apiClient.post("/api/users/signup", {
        name: form.name,
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

  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign Up</title>
      </Helmet>
      <h1 className="my-3">Sign Up</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={form[(event) => event.target.id]}
            onChange={(event) => setField(event.target.id, event.target.value)}
            isInvalid={!!errorsForm.name}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errorsForm.name}
          </Form.Control.Feedback>
        </Form.Group>
        <EmailField
          value={form.email}
          onChange={(event) => setField(event.target.id, event.target.value)}
          error={errorsForm.email}
          spacing="mb-3"
          required
        />
        <PasswordField
          value={form.password}
          onChange={(event) => setField(event.target.id, event.target.value)}
          error={errorsForm.password}
          strengthBar
          required
        />
        <PasswordField
          value={form.confirmPassword}
          onChange={(event) => setField(event.target.id, event.target.value)}
          controlId="confirmPassword"
          label="Confirm Password"
          error={errorsForm.confirmPassword}
          spacing="mb-3"
          required
        />
        <div className="mb-3">
          <Button type="submit">Sign Up</Button>
        </div>
        <div className="mb-3">
          Already have an account{"  "}
          <Link to={`/signin?redirect=${redirect}`}>Sign-In</Link>
        </div>
      </Form>
    </Container>
  );
}
