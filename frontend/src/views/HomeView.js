import { useEffect, useReducer } from "react";
import { Row, Col } from "react-bootstrap";
import Product from "../components/Product";
import * as Constants from "../constants/Constants";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { getError } from "../utils/utils";
import apiClient from "../components/ApiClient";

export default function HomeView() {
  const reducer = Constants.reducer;

  const [{ loading, error, object }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    object: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const result = await apiClient.get("/api/products");
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", error: getError(error) });
      }
    };
    fetchData();
  }, []);

  const products = object;

  return (
    <div>
      <Helmet>
        <title>Ecommerce</title>
      </Helmet>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <h1>Featured Products</h1>
          <div className="products">
            <Row>
              {products.map((product) => (
                <Col sm={6} md={4} lg={3} className="mb-3" key={product.slug}>
                  <Product product={product}></Product>
                </Col>
              ))}
            </Row>
          </div>
        </>
      )}
    </div>
  );
}
