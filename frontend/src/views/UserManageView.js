import { useEffect, useReducer, useState } from "react";
import apiClient from "../components/ApiClient";
import { getError } from "../utils/utils";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import toast from "react-hot-toast";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        users: action.payload.users,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...state, error: action.payload, loading: false };

    default:
      return state;
  }
};

export default function UserManageView() {
  const navigateTo = useNavigate();
  const [refresh, setRefresh] = useState(true);
  const { search } = useLocation();
  const pageParam = new URLSearchParams(search).get("page");
  const page = !pageParam || pageParam < 1 ? 1 : pageParam;
  const [{ loading, error, users, pages }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    users: [],
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [form, setForm] = useState({});
  const [errorsForm, setErrorsForm] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await apiClient.get(`/api/users/admin?page=${page}`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
        setRefresh(false);
        if (page > data.pages) {
          navigateTo(`?page=${data.pages}`);
        }
      } catch (error) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(error),
        });
        setRefresh(false);
      }
    };
    fetchData();
  }, [navigateTo, page, refresh]);

  const handleShowDeleteModal = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const handleShowUpdateModal = (userId) => {
    const user = users.find((user) => user._id === userId);
    if (user) {
      setForm({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    }
    setShowUpdateModal(true);
  };
  const handleCloseUpdateModal = () => setShowUpdateModal(false);

  const handleOnExitedModal = () => {
    setForm({});
  };

  const setField = (field, value) => {
    setForm({ ...form, [field]: value });
    if (!!errorsForm[field]) {
      setErrorsForm({ ...errorsForm, [field]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    return newErrors;
  };

  const deleteHandler = async () => {
    const deleteUser = async () => {
      await apiClient.delete(`/api/users/${userToDelete}`);
    };
    await toast.promise(deleteUser(), {
      loading: "Deleting user...",
      success: () => {
        handleCloseDeleteModal();
        setRefresh(true);
        return <b>User updated successfully</b>;
      },
      error: (error) => `Error: ${getError(error)}`,
    });
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrorsForm(formErrors);
      return;
    }
    const updateUser = async () => {
      await apiClient.put(`/api/users/${form._id}`, {
        name: form.name,
        email: form.email,
        isAdmin: form.isAdmin,
      });
    };
    await toast.promise(updateUser(), {
      loading: "Updating user...",
      success: () => {
        handleCloseUpdateModal();
        setRefresh(true);
        return <b>User updated successfully</b>;
      },
      error: (error) => `Error: ${getError(error)}`,
    });
  };

  return (
    <div>
      <Helmet>
        <title>Users</title>
      </Helmet>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Container fluid>
          <h1>Users</h1>
          <Table responsive>
            <thead>
              <tr>
                <th>ACTIONS</th>
                <th>ID</th>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>IS ADMIN</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="d-flex">
                      <Button
                        type="button"
                        variant="dark"
                        onClick={() => handleShowUpdateModal(user._id)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="mx-1"
                        onClick={() => handleShowDeleteModal(user._id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                  <td>{user._id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.isAdmin ? "YES" : "NO"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div>
            {[...Array(pages).keys()].map((mappedPage) => (
              <Link
                className={
                  mappedPage + 1 === Number(page) ? "text-bold btn" : "btn"
                }
                key={mappedPage + 1}
                to={`/admin/users?page=${mappedPage + 1}`}
              >
                {mappedPage + 1}
              </Link>
            ))}
          </div>

          <Modal
            show={showUpdateModal}
            onHide={handleCloseUpdateModal}
            size="xl"
            onExited={handleOnExitedModal}
            keyboard={false}
            backdrop="static"
          >
            <Form onSubmit={submitHandler}>
              <Modal.Header closeButton>
                <Modal.Title>Update</Modal.Title>
              </Modal.Header>
              <Modal.Body>
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
                    value={form.email}
                    type="email"
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
                <Form.Group className="mb-3" controlId="isAdmin">
                  <Form.Check
                    type="switch"
                    checked={form.isAdmin}
                    label="isAdmin"
                    onChange={(event) =>
                      setField(event.target.id, event.target.checked)
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errorsForm.isAdmin}
                  </Form.Control.Feedback>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseUpdateModal}>
                  Close
                </Button>
                <Button variant="primary" type="submit">
                  Update User
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>

          <Modal
            show={showDeleteModal}
            onHide={handleCloseDeleteModal}
            size="sm"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Are you sure to Delete?</Modal.Title>
            </Modal.Header>
            <Modal.Footer>
              <Button variant="danger" onClick={deleteHandler}>
                Delete
              </Button>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      )}
    </div>
  );
}
