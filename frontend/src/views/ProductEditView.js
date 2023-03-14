import { useEffect, useReducer, useRef, useState } from "react";
import apiClient from "../components/ApiClient";
import { useNavigate, useParams } from "react-router-dom";
import { getError } from "../utils/utils";
import {
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Modal,
  Row,
} from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import toast from "react-hot-toast";
import ImageModal from "../components/ImageModal";

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
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [modalImagesFiles, setModalImagesFiles] = useState([]);
  const [showImageModalCover, setShowImageModalCover] = useState(false);
  const [showImageModalList, setShowImageModalList] = useState(false);
  const [imageModalListIndex, setImageModalListIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageIndexToDelete, setImageIndexToDelete] = useState(null);
  const [functionalSlug, setFunctionalSlug] = useState(false);
  const inputCoverImage = useRef(null);
  const btnImages = useRef(null);
  const updateBtnImages = useRef(null);

  const setField = (field, value) => {
    setForm({ ...form, [field]: value });
    if (!!errorsForm[field]) {
      setErrorsForm({ ...errorsForm, [field]: null });
    }
  };

  const openImageModal = (index) => {
    setShowImageModalList(true);
    setImageModalListIndex(index);
  };

  const handleShowDeleteModal = (index) => {
    setShowDeleteModal(true);
    setImageIndexToDelete(index);
  };
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

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
          coverImage: data.coverImage,
          category: data.category,
          countInStock: data.countInStock,
          brand: data.brand,
          description: data.description,
          images: data.images,
        });
        setModalImagesFiles(data.images);
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
      const uploadImage = async (file) => {
        const bodyFormData = new FormData();
        bodyFormData.append("file", file);
        const { data: uploadData } = await apiClient.post(
          "/api/upload",
          bodyFormData,
          {
            "Content-Type": "multipart/form-data",
          }
        );
        return uploadData;
      };
      if (coverImageFile) {
        const uploadData = await uploadImage(coverImageFile.file);
        form.coverImage = uploadData.secure_url;
      }

      if (modalImagesFiles) {
        const listOfUploadedData = [];
        for (const index in modalImagesFiles) {
          if (modalImagesFiles[index].file) {
            const uploadData = await uploadImage(modalImagesFiles[index].file);
            listOfUploadedData.push(uploadData.secure_url);
          } else {
            listOfUploadedData.push(modalImagesFiles[index]);
          }
        }
        form.images = listOfUploadedData;
      }

      await apiClient.put(`/api/products/${productId}`, {
        id: productId,
        name: form.name,
        slug: form.slug,
        price: form.price,
        coverImage: form.coverImage,
        images: form.images,
        category: form.category,
        countInStock: form.countInStock,
        brand: form.brand,
        description: form.description,
      });
      setFunctionalSlug(form.slug);
    };

    await toast.promise(updateProduct(), {
      loading: "Updating product...",
      success: () => {
        dispatch({ type: "UPDATE_FINISH" });
        return <b>Product Updated</b>;
      },
      error: (error) => {
        dispatch({ type: "UPDATE_FINISH" });
        return `Error: ${getError(error)}`;
      },
    });
  };

  const setCoverFileHandler = async (event) => {
    const file = {
      file: event.target.files[0],
      path: URL.createObjectURL(event.target.files[0]),
    };
    setCoverImageFile(file);
  };

  const setImagesFilesHandler = async (event) => {
    if (modalImagesFiles && modalImagesFiles.length >= 4) {
      toast.error("Photo limit reached (4 per product)");
    } else {
      const file = {
        file: event.target.files[0],
        path: URL.createObjectURL(event.target.files[0]),
      };
      setModalImagesFiles([...modalImagesFiles, file]);
    }
  };

  const updateImageFileHandler = async (event, index) => {
    const file = {
      file: event.target.files[0],
      path: URL.createObjectURL(event.target.files[0]),
    };
    let updatedImageFiles = modalImagesFiles;
    updatedImageFiles[index] = file;
    setModalImagesFiles([...updatedImageFiles]);
  };

  const deleteHandler = () => {
    let updatedImageFiles = modalImagesFiles;
    updatedImageFiles.splice(imageIndexToDelete, 1);
    setModalImagesFiles([...updatedImageFiles]);
    setImageIndexToDelete(null);
    handleCloseDeleteModal();
  };

  return (
    <Container className="mb-2">
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
                    pattern="[0-9]*"
                    onKeyDown={(e) => {
                      if (["e", "E", ".", "+", "& ", "-"].includes(e.key)) {
                        e.preventDefault();
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
                    onKeyDown={(e) => {
                      if (["e", "E", ".", "+", "& ", "-"].includes(e.key)) {
                        e.preventDefault();
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
              <div className="img-upld-vslzer mt-2">
                <Form.Group controlId="coverImage" className="text-center">
                  <Form.Control
                    type="file"
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={setCoverFileHandler}
                    isInvalid={!!errorsForm.coverImage}
                    ref={inputCoverImage}
                  />
                  <Button onClick={() => inputCoverImage.current.click()}>
                    Change Cover Image
                  </Button>
                </Form.Group>
                <div className="text-center">
                  {coverImageFile ? (
                    <div>
                      <img
                        src={coverImageFile.path}
                        onClick={() => setShowImageModalCover(true)}
                        alt={form.name}
                        className="rounded img-thumbnail-upload"
                      />
                      {showImageModalCover && (
                        <ImageModal
                          imagesSrc={coverImageFile.path}
                          setShowModal={setShowImageModalCover}
                        />
                      )}
                    </div>
                  ) : (
                    <div>
                      <img
                        src={form.coverImage}
                        onClick={() => setShowImageModalCover(true)}
                        alt={form.name}
                        className="rounded img-thumbnail-upload"
                      />
                      {showImageModalCover && (
                        <ImageModal
                          imagesSrc={form.coverImage}
                          setShowModal={setShowImageModalCover}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
          <h5>Add additional images</h5>
          <Row className="mltpl-img-upld-vslzer mb-3">
            <Col>
              <Row className="h-100">
                <Col className="col-3 ps-3">
                  <Form.Group
                    controlId="imagesButton"
                    className="vslzer-btn-wrap text-center"
                  >
                    <Form.Control
                      type="file"
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={setImagesFilesHandler}
                      ref={btnImages}
                    />
                    <Button
                      className="vslzer-btn"
                      onClick={() => btnImages.current.click()}
                      disabled={
                        modalImagesFiles && modalImagesFiles.length >= 4
                      }
                    >
                      <i className="fa-solid fa-plus" />
                    </Button>
                  </Form.Group>
                </Col>
                <Col className="col-9 pe-3 pb-2 d-flex overflow-auto">
                  {modalImagesFiles.length > 0 && (
                    <div className="vslzer-img-wrap mx-2">
                      {modalImagesFiles.map((imageFile, index) => (
                        <div key={index} className="vslzer-img mx-1">
                          <div>
                            <Row className="px-1">
                              <Col>
                                <Button
                                  onClick={() =>
                                    document
                                      .getElementById("imagesVslzer_" + index)
                                      .click()
                                  }
                                >
                                  Change
                                </Button>
                              </Col>
                              <Col md="3" className="p-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleShowDeleteModal(index);
                                  }}
                                  className="deleteModalImage"
                                >
                                  <i className="fa-solid fa-trash" />
                                </button>
                              </Col>
                            </Row>
                          </div>
                          <Form.Group
                            controlId={"imagesVslzer_" + index}
                            className="text-center"
                          >
                            <Form.Control
                              type="file"
                              style={{ display: "none" }}
                              accept="image/*"
                              onChange={(event) =>
                                updateImageFileHandler(event, index)
                              }
                              ref={updateBtnImages}
                            />
                          </Form.Group>
                          <div className="text-center">
                            {imageFile.path ? (
                              <img
                                src={imageFile.path}
                                id={index}
                                onClick={() => openImageModal(index)}
                                alt={imageFile.path}
                                className="rounded img-thumbnail-upload"
                              />
                            ) : (
                              <img
                                src={imageFile}
                                id={index}
                                onClick={() => openImageModal(index)}
                                alt={imageFile}
                                className="rounded img-thumbnail-upload"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Col>
              </Row>
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
      {showImageModalList && (
        <ImageModal
          imagesSrc={modalImagesFiles.map((file) => {
            const src = file.path ? file.path : file;
            return src;
          })}
          index={imageModalListIndex}
          setShowModal={setShowImageModalList}
        />
      )}
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
  );
}
