import { useReducer, useContext, useState } from "react";
import apiClient from "../components/ApiClient";
import { Form, Button } from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import { Store } from "../context/Store";
import { getError } from "../utils/utils";
import LoadingBox from "../components/LoadingBox";
import toast from "react-hot-toast";

const reducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_REQUEST":
      return { ...state, loading: true };
    case "UPDATE_SUCCESS":
      return { ...state, loading: false };
    case "UPDATE_FAIL":
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function ProfileView() {
  const { state, dispatch: contextDispatch } = useContext(Store);
  const { userInfo } = state;

  const [form, setForm] = useState({
    name: userInfo.name,
    email: userInfo.email,
    changePassword: false,
  });
  const [errorsForm, setErrorsForm] = useState({});
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const setField = (field, value) => {
    setForm({ ...form, [field]: value });
    if (!!errorsForm[field]) {
      setErrorsForm({ ...errorsForm, [field]: null });
    }
  };

  const setChangePassword = (value) => {
    setField("newPassword", "");
    form.newPassword = "";
    setField("confirmNewPassword", "");
    form.confirmNewPassword = "";
    setField("changePassword", value);
  };

  const validateForm = () => {
    const newErrors = {};
    if (form.changePassword && form.newPassword !== form.confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords does not match";
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
      dispatch({
        type: "UPDATE_REQUEST",
      });
      const { data } = await apiClient.put("/api/users/profile", {
        name: form.name,
        email: form.email,
        password: form.password,
        newPassword: form.newPassword,
      });
      setField("changePassword", false);
      dispatch({
        type: "UPDATE_SUCCESS",
      });
      contextDispatch({ type: "USER_SIGNIN", payload: data });
      toast.success("User updated successfully");
    } catch (error) {
      setField("changePassword", false);
      dispatch({
        type: "UPDATE_FAIL",
      });
      toast.error(getError(error));
    }
  };

  return (
    <div className="container small-container">
      <Helmet>
        <title>User Profile</title>
      </Helmet>
      {loading ? (
        <LoadingBox />
      ) : (
        <div>
          <h1 className="my-3">User Profile</h1>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(event) =>
                  setField(event.target.id, event.target.value)
                }
                isInvalid={!!errorsForm.name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errorsForm.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(event) =>
                  setField(event.target.id, event.target.value)
                }
                isInvalid={!!errorsForm.email}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errorsForm.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Current password</Form.Label>
              <Form.Control
                type="password"
                value={form[(event) => event.target.id]}
                onChange={(event) =>
                  setField(event.target.id, event.target.value)
                }
                isInvalid={!!errorsForm.password}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errorsForm.password}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="changePassword">
              <Form.Check
                type="switch"
                value={form.changePassword.checked}
                label="Change Password?"
                onChange={(event) => setChangePassword(event.target.checked)}
              />
            </Form.Group>
            {form.changePassword && (
              <div>
                <Form.Group className="mb-3" controlId="newPassword">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={form.newPassword}
                    onChange={(event) =>
                      setField("newPassword", event.target.value)
                    }
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
              </div>
            )}
            <div className="mb-3">
              <Button type="submit">Update</Button>
            </div>
          </Form>
        </div>
      )}
    </div>
  );
}
