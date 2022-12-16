import { useNavigate, useParams } from "react-router-dom";
import * as Constants from "../constants/Constants";
import { useEffect, useReducer, useContext, useState } from "react";
import { Row, Col, ListGroup, Card, Badge, Button } from "react-bootstrap";
import apiClient from "../components/ApiClient";
import Rating from "../components/Rating";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { getError } from "../utils/utils";
import { Store } from "../context/Store";
import toast from "react-hot-toast";
import ImageModal from "./ImageModal";

export default function ProductView() {
  const { slug } = useParams();
  const reducer = Constants.reducer;
  const navigateTo = useNavigate();
  const [showImageModal, setShowImageModal] = useState(false);

  const [{ loading, error, object }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    object: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const result = await apiClient.get(`/api/products/slug/${slug}`);
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", error: getError(error) });
      }
    };
    fetchData();
  }, [slug]);

  const product = object;

  const { state, dispatch: contextDispatch } = useContext(Store);

  const AddToCartHandler = async () => {
    const { cart } = state;
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
      {showImageModal && (
        <ImageModal
          imagesSrc={product.image}
          setShowModal={setShowImageModal}
        />
      )}
    </div>
  );
}
