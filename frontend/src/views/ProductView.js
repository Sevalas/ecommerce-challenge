import { Link, useNavigate, useParams } from "react-router-dom";
import * as Constants from "../constants/Constants";
import { useEffect, useReducer, useContext, useState, useRef } from "react";
import {
  Form,
  Row,
  Col,
  ListGroup,
  Card,
  Badge,
  Button,
  FloatingLabel,
} from "react-bootstrap";
import apiClient from "../components/ApiClient";
import Rating from "../components/Rating";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { getError } from "../utils/utils";
import { Store } from "../context/Store";
import toast from "react-hot-toast";
import ImageModal from "../components/ImageModal";

export default function ProductView() {
  let reviewsRef = useRef();
  const [refresh, setRefresh] = useState(true);
  const { state, dispatch: contextDispatch } = useContext(Store);
  const { cart, userInfo } = state;
  const { slug } = useParams();
  const reducer = Constants.reducer;
  const navigateTo = useNavigate();
  const [showImageModal, setShowImageModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [{ loading, error, object, loadingCreateReview }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
      object: [],
    });
  const product = object;

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const result = await apiClient.get(`/api/products/slug/${slug}`);
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        setRefresh(false);
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", error: getError(error) });
        setRefresh(false);
      }
    };
    fetchData();
  }, [slug, refresh]);

  const AddToCartHandler = async () => {
    const existItem = cart.cartItems.find((item) => item._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await apiClient.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      toast.error("sorry, this product is out of stock", {
        toastId: product._id,
      });
    } else {
      contextDispatch({
        type: "CART_ADD_ITEM",
        payload: { ...product, quantity },
      });

      navigateTo("/cart");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error("please enter comment and rating");
      return;
    }
    const postReview = async () => {
      await apiClient.post(`/api/products/${product._id}/reviews`, {
        rating,
        comment,
      });
    };
    await toast.promise(postReview(), {
      loading: "Creating review...",
      success: () => {
        setRating(0);
        setComment("");
        setRefresh(true);
        return <b>Review created successfully</b>;
      },
      error: (error) => `Error: ${getError(error)}`,
    });
  };

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Row>
        <Col md={6} className="text-center">
          <img
            className="img-product-view"
            src={product.image}
            alt={product.name}
            onClick={() => setShowImageModal(true)}
          />
        </Col>
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Helmet>
                <title>{product.name}</title>
              </Helmet>
              <h1>{product.name}</h1>
            </ListGroup.Item>
            <ListGroup.Item>
              <Rating
                rating={product.rating}
                numReviews={product.numReviews}
              ></Rating>
            </ListGroup.Item>
            <ListGroup.Item>Price: ${product.price}</ListGroup.Item>
            <ListGroup.Item>
              Description:
              <p>{product.description}</p>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col>${product.price}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Status:</Col>
                    <Col>
                      {product.countInStock > 0 ? (
                        <Badge bg="success">In Stock</Badge>
                      ) : (
                        <Badge bg="danger">Unavailable</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>
                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button variant="primary" onClick={AddToCartHandler}>
                        Add to Cart
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="my-3">
        <h2 ref={reviewsRef}>Reviews</h2>
        {product.reviews.length === 0 ? (
          <div className="my-3">
            <MessageBox>There is no review yet</MessageBox>
          </div>
        ) : (
          <ListGroup>
            {product.reviews.map((review) => (
              <ListGroup.Item key={review._id}>
                <strong>{review.name}</strong>
                <Rating rating={review.rating} caption=" "></Rating>
                <p>{review.createdAt.substring(0, 10)}</p>
                <p>{review.comment}</p>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
        <div className="my-3">
          {userInfo ? (
            <form onSubmit={submitHandler}>
              <h2>Write a customer review</h2>
              <Form.Group className="mb-3" controlId="rating">
                <Form.Label>Rating</Form.Label>
                <Form.Select
                  aria-label="Rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="1">1- Poor</option>
                  <option value="2">2- Fair</option>
                  <option value="3">3- Good</option>
                  <option value="4">4- Very good</option>
                  <option value="5">5- Excelent</option>
                </Form.Select>
              </Form.Group>
              <FloatingLabel
                controlId="floatingTextarea"
                label="Comments"
                className="mb-3"
              >
                <Form.Control
                  as="textarea"
                  placeholder="Leave a comment here"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </FloatingLabel>

              <div className="mb-3">
                <Button disabled={loadingCreateReview} type="submit">
                  Submit
                </Button>
                {loadingCreateReview && <LoadingBox></LoadingBox>}
              </div>
            </form>
          ) : (
            <MessageBox>
              Please{" "}
              <Link to={`/signin?redirect=/product/${product.slug}`}>
                Sign In
              </Link>{" "}
              to write a review
            </MessageBox>
          )}
        </div>
      </div>

      {showImageModal && (
        <ImageModal
          imagesSrc={product.image}
          setShowModal={setShowImageModal}
        />
      )}
    </div>
  );
}
