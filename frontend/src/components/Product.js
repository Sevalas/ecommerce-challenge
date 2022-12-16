import { Link } from "react-router-dom";
import { Card, Button } from "react-bootstrap";
import Rating from "./Rating";
import { Store } from "../context/Store";
import { useContext, useState } from "react";
import apiClient from "../components/ApiClient";
import toast from "react-hot-toast";

export default function Product(props) {
  const { product } = props;

  const { state, dispatch: contextDispatch } = useContext(Store);
  const [productOutSotckWithCart, setProductOutSotckWithCart] = useState(false);

  const AddToCartHandler = async (item) => {
    const { cart } = state;
    const existItem = cart.cartItems.find((item) => item._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await apiClient.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      setProductOutSotckWithCart(true);
      toast.error("sorry, this product is out of stock", {
        toastId: product._id,
      });
    } else {
      setProductOutSotckWithCart(false);
      contextDispatch({
        type: "CART_ADD_ITEM",
        payload: { ...item, quantity },
      });
    }
  };

  return (
    <Card>
      <Link to={{ pathname: `/product/${product.slug}` }}>
        <img
          className="product-component-card-img-top"
          src={product.image}
          alt={product.name}
        />
      </Link>
      <Card.Body>
        <Link to={{ pathname: `/product/${product.slug}` }}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
        <Rating
          rating={product.rating}
          numReviews={product.numReviews}
        ></Rating>
        <Card.Text>${product.price}</Card.Text>
        {product.countInStock === 0 || productOutSotckWithCart ? (
          <Button variant="light" disabled>
            Out of Stock
          </Button>
        ) : (
          <Button onClick={() => AddToCartHandler(product)}>Add to cart</Button>
        )}
      </Card.Body>
    </Card>
  );
}
