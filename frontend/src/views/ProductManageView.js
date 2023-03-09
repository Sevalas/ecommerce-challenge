import { useEffect, useReducer, useRef, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Modal,
  Row,
  Table,
} from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import apiClient from "../components/ApiClient";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { getError } from "../utils/utils";
import toast from "react-hot-toast";
import ImageModal from "../components/ImageModal";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        products: action.payload.products,
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

export default function ProductManageView() {
  const navigateTo = useNavigate();
  const [refresh, setRefresh] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [form, setForm] = useState({});
  const [errorsForm, setErrorsForm] = useState({});
  const [{ loading, error, products, pages }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    products: [],
  });
  const [newImageFile, setNewImageFile] = useState(null);
  const inputFile = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const { search } = useLocation();
  const pageParam = new URLSearchParams(search).get("page");
  const page = !pageParam || pageParam < 1 ? 1 : pageParam;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await apiClient.get(
          `/api/products/admin?page=${page}`
        );
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

  const handleShowProductModal = () => setShowProductModal(true);
  const handleCloseProductModal = () => setShowProductModal(false);
  const handleShowDeleteModal = (productId) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const handlOnExitedModal = () => {
    setShowImageModal(false);
    setForm({});
    setNewImageFile(null);
  };

  const setField = (field, value) => {
    setForm({ ...form, [field]: value });
    if (!!errorsForm[field]) {
      setErrorsForm({ ...errorsForm, [field]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.image) {
      newErrors.image = "Image is required";
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
    const updateProduct = async () => {
      if (newImageFile) {
        const file = newImageFile.file;
        const bodyFormData = new FormData();
        bodyFormData.append("file", file);
        const { data: uploadData } = await apiClient.post(
          "/api/upload",
          bodyFormData,
          {
            "Content-Type": "multipart/form-data",
          }
        );
        form.image = uploadData.secure_url;
      }
      await apiClient.post("/api/products", {
        name: form.name,
        slug: form.slug,
        brand: form.brand,
        category: form.category,
        description: form.description,
        price: form.price,
        countInStock: form.countInStock,
        image: form.image,
      });
    };
    await toast.promise(updateProduct(), {
      loading: "Creating product...",
      success: () => {
        handleCloseProductModal();
        setRefresh(true);
        return <b>Product created successfully</b>;
      },
      error: (error) => `Error: ${getError(error)}`,
    });
  };

  const uploadFileHandler = async (event) => {
    const file = {
      file: event.target.files[0],
      path: URL.createObjectURL(event.target.files[0]),
    };
    setNewImageFile(file);
    setField("image", file.path);
  };

  const deleteHandler = async () => {
    const deleteProduct = async () => {
      await apiClient.delete(`/api/products/${productToDelete}`);
    };
    await toast.promise(deleteProduct(), {
      loading: "Deleting product...",
      success: () => {
        handleCloseDeleteModal();
        setRefresh(true);
        return <b>Product deleted successfully</b>;
      },
      error: (error) => `Error: ${getError(error)}`,
    });
  };
  return (
    <div>
      <Helmet>
        <title>Products</title>
      </Helmet>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Container fluid>
          <Row>
            <Col>
              <h1>Products</h1>
            </Col>
            <Col className="text-end">
              <div>
                <Button onClick={handleShowProductModal}>Create Product</Button>
              </div>
            </Col>
          </Row>
          <Table responsive>
            <thead>
              <tr>
                <th>ACTIONS</th>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="d-flex">
                      <Button
                        type="button"
                        variant="dark"
                        onClick={() => {
                          navigateTo(`/product/${product.slug}`);
                        }}
                      >
                        Details
                      </Button>
                      <Button
                        type="button"
                        className="mx-1"
                        onClick={() => {
                          navigateTo(`/admin/product/${product._id}`);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="mx-1"
                        onClick={() => handleShowDeleteModal(product._id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
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
                to={`/admin/products?page=${mappedPage + 1}`}
              >
                {mappedPage + 1}
              </Link>
            ))}
          </div>

          <Modal
            show={showProductModal}
            onHide={handleCloseProductModal}
            size="xl"
            onExited={handlOnExitedModal}
            keyboard={false}
            backdrop="static"
          >
            <Form onSubmit={submitHandler}>
              <Modal.Header closeButton>
                <Modal.Title>Create</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col>
                    <Form.Group className="mb-3" controlId="name">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        value={form[(event) => event.target.id]}
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
                  </Col>
                  <Col>
                    <Form.Group className="mb-3" controlId="slug">
                      <Form.Label>Slug</Form.Label>
                      <Form.Control
                        value={form[(event) => event.target.id]}
                        onChange={(event) =>
                          setField(event.target.id, event.target.value)
                        }
                        isInvalid={!!errorsForm.slug}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errorsForm.slug}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group className="mb-3" controlId="brand">
                      <Form.Label>Brand</Form.Label>
                      <Form.Control
                        value={form[(event) => event.target.id]}
                        onChange={(event) =>
                          setField(event.target.id, event.target.value)
                        }
                        isInvalid={!!errorsForm.brand}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errorsForm.brand}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3" controlId="category">
                      <Form.Label>Category</Form.Label>
                      <Form.Control
                        value={form[(event) => event.target.id]}
                        onChange={(event) =>
                          setField(event.target.id, event.target.value)
                        }
                        isInvalid={!!errorsForm.category}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errorsForm.category}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group className="mb-3" controlId="price">
                      <Form.Label>Price</Form.Label>
                      <InputGroup className="mb-3">
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          value={form[(event) => event.target.id]}
                          type="number"
                          onKeyDown={(event) => {
                            if (!/[0-9]/.test(event.key)) {
                              event.preventDefault();
                            }
                          }}
                          onChange={(event) =>
                            setField(event.target.id, event.target.value)
                          }
                          isInvalid={!!errorsForm.price}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {errorsForm.price}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3" controlId="countInStock">
                      <Form.Label>Count in stock</Form.Label>
                      <InputGroup className="mb-3">
                        <InputGroup.Text>#</InputGroup.Text>
                        <Form.Control
                          value={form[(event) => event.target.id]}
                          type="number"
                          onKeyDown={(event) => {
                            if (!/[0-9]/.test(event.key)) {
                              event.preventDefault();
                            }
                          }}
                          onChange={(event) =>
                            setField(event.target.id, event.target.value)
                          }
                          isInvalid={!!errorsForm.countInStock}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {errorsForm.countInStock}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group controlId="description">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows="4"
                        value={form.description}
                        onChange={(event) =>
                          setField("description", event.target.value)
                        }
                        isInvalid={!!errorsForm.description}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errorsForm.description}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col className="d-flex justify-content-center" md="auto">
                    <Form.Group controlId="image" className="text-center">
                      <div className="img-upld-vslzer mt-2">
                        <Form.Control
                          type="file"
                          style={{ display: "none" }}
                          accept="image/*"
                          onChange={uploadFileHandler}
                          isInvalid={!!errorsForm.image}
                          ref={inputFile}
                        />
                        <Button onClick={() => inputFile.current.click()}>
                          Change Image
                        </Button>
                        <div className="text-center">
                          <img
                            src={form.image}
                            onClick={() =>
                              form.image && setShowImageModal(true)
                            }
                            alt={form.name}
                            className="rounded img-thumbnail-upload"
                          />
                          {showImageModal && (
                            <ImageModal
                              imagesSrc={form.image}
                              setShowModal={setShowImageModal}
                            />
                          )}
                        </div>
                        <Form.Control.Feedback type="invalid">
                          {errorsForm.image}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseProductModal}>
                  Close
                </Button>
                <Button variant="primary" type="submit">
                  Create Product
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
