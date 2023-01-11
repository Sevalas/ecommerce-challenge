import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useReducer, useContext, useState, useRef } from "react";
import {
  Form,
  Row,
  Col,
  ListGroup,
  Card,
  Badge,
  Button,
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
import { PaginationControl } from "react-bootstrap-pagination-control";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_PRODUCT_REQUEST":
      return { ...state, loading: true };
    case "FETCH_PRODUCT_SUCCESS":
      return { ...state, loading: false, product: action.payload };
    case "FETCH_PRODUCT_FAIL":
      return { ...state, error: action.payload, loading: false };
    case "FETCH_REVIEWS_REQUEST":
      return { ...state, reviewsLoading: true };
    case "FETCH_REVIEWS_SUCCESS":
      return { ...state, reviewsLoading: false, reviews: action.payload };
    case "FETCH_REVIEWS_FAIL":
      return { ...state, reviewsError: action.payload, reviewsLoading: false };
    default:
      return state;
  }
};

export default function ProductView() {
  let reviewsRef = useRef();
  const [refresh, setRefresh] = useState(true);
  const { state, dispatch: contextDispatch } = useContext(Store);
  const { cart, userInfo } = state;
  const { slug } = useParams();
  const navigateTo = useNavigate();
  const [showImageModal, setShowImageModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const pageSize = 4;

  const [
    {
      loading,
      error,
      product,
      reviews,
      reviewsLoading,
      reviewsError,
      loadingCreateReview,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: "",
    product: {},
    reviewsLoading: true,
    reviews: {},
  });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_PRODUCT_REQUEST" });
      try {
        const productResult = await apiClient.get(`/api/products/slug/${slug}`);
        dispatch({
          type: "FETCH_PRODUCT_SUCCESS",
          payload: productResult.data,
        });
        try {
          if (productResult.data && productResult.data._id) {
            dispatch({ type: "FETCH_REVIEWS_REQUEST" });
            const resultReviews = await apiClient.get(
              `/api/products/${productResult.data._id}/reviews`
            );
            dispatch({
              type: "FETCH_REVIEWS_SUCCESS",
              payload: resultReviews.data,
            });
          }
        } catch (error) {
          dispatch({
            type: "FETCH_REVIEWS_FAIL",
            payload: getError(error),
          });
        }
        setRefresh(false);
      } catch (error) {
        dispatch({ type: "FETCH_PRODUCT_FAIL", payload: getError(error) });
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
      toast.error("Please enter comment and rating");
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

  const reviewPaginator = async (page) => {
    try {
      dispatch({ type: "FETCH_REVIEWS_REQUEST" });
      const resultReviews = await apiClient.get(
        `/api/products/${product._id}/reviews?page=${page}`
      );
      dispatch({
        type: "FETCH_REVIEWS_SUCCESS",
        payload: resultReviews.data,
      });
    } catch (error) {
      dispatch({ type: "FETCH_REVIEWS_FAIL", error: getError(error) });
    }
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
        <div>
          {reviewsLoading ? (
            <div className="my-3">
              <MessageBox>Loading comments...</MessageBox>
            </div>
          ) : reviewsError ? (
            <div className="my-3">
              <MessageBox variant="danger">{reviewsError}</MessageBox>
            </div>
          ) : (
            <div>
              {!reviews || !reviews.reviews || reviews.reviews.length === 0 ? (
                <div className="my-3">
                  <MessageBox>There is no review yet</MessageBox>
                </div>
              ) : (
                <div>
                  <ListGroup>
                    {reviews.reviews.map((review) => (
                      <ListGroup.Item
                        key={review._id}
                        className="product-comment"
                      >
                        <strong>{review.name}</strong>
                        <Rating rating={review.rating} caption=" "></Rating>
                        <p>{review.createdAt.substring(0, 10)}</p>
                        <p className="comment-box">{review.comment}</p>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  {reviews.pages > 1 && (
                    <div className="d-flex justify-content-center overflow-auto">
                      <PaginationControl
                        page={reviews.page}
                        total={reviews.countReviews}
                        limit={pageSize}
                        ellipsis={1}
                        changePage={(page) => {
                          reviewPaginator(page);
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="my-3">
          {userInfo ? (
            <form onSubmit={submitHandler}>
              <h2>Write a customer review</h2>
              <Form.Group className="mb-1" controlId="rating">
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
              <Form.Group className="mb-1" controlId="comment">
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  placeholder="Leave a comment here"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Form.Group>
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
