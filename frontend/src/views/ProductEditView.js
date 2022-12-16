import { useEffect, useReducer, useRef, useState } from "react";
import apiClient from "../components/ApiClient";
import { useNavigate, useParams } from "react-router-dom";
import { getError } from "../utils/utils";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import toast from "react-hot-toast";
import ImageModal from "./ImageModal";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false };
    case "FETCH_FAIL":
      return { ...state, error: action.payload, loading: false };
    case "UPDATE_REQUEST":
      return { ...state, updateLoading: true };
    case "UPDATE_FINISH":
      return { ...state, updateLoading: false };
    default:
      return state;
  }
};

export default function ProductEditView() {
  const { id: productId } = useParams();
  const navigateTo = useNavigate();
  const [{ loading, error, updateLoading }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  const [form, setForm] = useState({});
  const [errorsForm, setErrorsForm] = useState({});
  const [newImageFile, setNewImageFile] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [functionalSlug, setFunctionalSlug] = useState(false);
  const inputFile = useRef(null);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await apiClient.get(`/api/products/${productId}`);
        setForm({
          name: data.name,
          slug: data.slug,
          price: data.price,
          image: data.image,
          category: data.category,
          countInStock: data.countInStock,
          brand: data.brand,
          description: data.description,
        });
        setFunctionalSlug(data.slug);
        dispatch({ type: "FETCH_SUCCESS" });
      } catch (error) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [productId]);

  const submitHandler = async (event) => {
    event.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrorsForm(formErrors);
      return;
    }

    const updateProduct = async () => {
      dispatch({ type: "UPDATE_REQUEST" });
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

      await apiClient.put(`/api/products/${productId}`, {
        id: productId,
        name: form.name,
        slug: form.slug,
        price: form.price,
        image: form.image,
        category: form.category,
        countInStock: form.countInStock,
        brand: form.brand,
        description: form.description,
      });
      setFunctionalSlug(form.slug);
    };

    await toast.promise(updateProduct(), {
      loading: "Updating product...",
      success: <b>Product Updated</b>,
      error: (error) => `Error: ${error}`,
    });
    dispatch({ type: "UPDATE_FINISH" });
  };

  const uploadFileHandler = async (event) => {
    const file = {
      file: event.target.files[0],
      path: URL.createObjectURL(event.target.files[0]),
    };
    setNewImageFile(file);
  };

  return (
    <Container>
      <Helmet>
        <title>Edit Product</title>
      </Helmet>
      <h1 style={{ overflow: "hidden" }}>Edit Product {productId}</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={submitHandler}>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  isInvalid={!!errorsForm.name}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errorsForm.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="slug">
                <Form.Label>Slug</Form.Label>
                <Form.Control
                  value={form.slug}
                  onChange={(event) => setField("slug", event.target.value)}
                  isInvalid={!!errorsForm.slug}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errorsForm.slug}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="category">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  value={form.category}
                  onChange={(event) => setField("category", event.target.value)}
                  isInvalid={!!errorsForm.category}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errorsForm.category}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="brand">
                <Form.Label>Brand</Form.Label>
                <Form.Control
                  value={form.brand}
                  onChange={(event) => setField("brand", event.target.value)}
                  isInvalid={!!errorsForm.brand}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errorsForm.brand}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="price">
                <Form.Label>Price</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    value={form.price}
                    type="number"
                    onKeyPress={(event) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                    onChange={(event) => setField("price", event.target.value)}
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
              <Form.Group controlId="countInStock">
                <Form.Label>Count in stock</Form.Label>
                <InputGroup>
                  <InputGroup.Text>#</InputGroup.Text>
                  <Form.Control
                    value={form.countInStock}
                    type="number"
                    onKeyPress={(event) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                    onChange={(event) =>
                      setField("countInStock", event.target.value)
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
            <Col className="mb-1">
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
            <Col className="mb-3 d-flex justify-content-center" md="auto">
              <div className="image-uploader-visualizer mt-2">
                <Form.Group controlId="image" className="text-center">
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
                </Form.Group>
                <div className="text-center">
                  {newImageFile ? (
                    <div>
                      <img
                        src={newImageFile.path}
                        onClick={() => setShowImageModal(true)}
                        alt={form.name}
                        className="rounded img-thumbnail-upload"
                      />
                      {showImageModal && (
                        <ImageModal
                          imagesSrc={newImageFile.path}
                          setShowModal={setShowImageModal}
                        />
                      )}
                    </div>
                  ) : (
                    <div>
                      <img
                        src={form.image}
                        onClick={() => setShowImageModal(true)}
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
                  )}
                </div>
              </div>
            </Col>
          </Row>
          <div className="mt-2 d-flex justify-content-end">
            <Button
              className="mx-1"
              type="submit"
              disabled={updateLoading === true}
            >
              Update
            </Button>
            <Button
              className="mx-1"
              variant="dark"
              onClick={() => {
                navigateTo(`/product/${functionalSlug}`);
              }}
            >
              Go to Product
            </Button>
          </div>
        </Form>
      )}
    </Container>
  );
}
