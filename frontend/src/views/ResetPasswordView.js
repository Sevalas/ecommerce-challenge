import { Container, Form, Button } from "react-bootstrap";
import apiClient from "../components/ApiClient";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store } from "../context/Store";
import toast from "react-hot-toast";
import { getError } from "../utils/utils";

export default function ResetPasswordView() {
  const navigateTo = useNavigate();
  const { token } = useParams();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [form, setForm] = useState({
    newPassword: "",
    confirmNewPassword: "",
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
    if (form.newPassword !== form.confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords does not match";
    }

    return newErrors;
  };

  useEffect(() => {
    if (userInfo || !token) {
      navigateTo("/");
    }
  }, [navigateTo, userInfo, token]);

  const submitHandler = async (event) => {
    event.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrorsForm(formErrors);
      return;
    }
    const resetPassword = async () => {
      return await apiClient.post("/api/users/reset-password", {
        password: form.newPassword,
        token,
      });
    };

    await toast.promise(resetPassword(), {
      loading: "Reseting password...",
      success: (response) => {
        navigateTo("/signin");
        return response.data.message;
      },
      error: (error) => `Error: ${getError(error)}`,
    });
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Reset Password</title>
      </Helmet>
      <h1 className="my-3">Reset Password</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="newPassword">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            value={form.newPassword}
            onChange={(event) => setField("newPassword", event.target.value)}
            isInvalid={!!errorsForm.newPassword}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errorsForm.newPassword}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="confirmNewPassword">
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control
            type="password"
            value={form.confirmNewPassword}
            onChange={(event) =>
              setField("confirmNewPassword", event.target.value)
            }
            isInvalid={!!errorsForm.confirmNewPassword}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errorsForm.confirmNewPassword}
          </Form.Control.Feedback>
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Reset Password</Button>
        </div>
      </Form>
    </Container>
  );
}
