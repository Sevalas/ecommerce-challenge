import { useEffect } from "react";
import { useReducer } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getError } from "../utils/utils";
import Rating from "../components/Rating";
import apiClient from "../components/ApiClient";
import { useState } from "react";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import MessageBox from "../components/MessageBox";
import LoadingBox from "../components/LoadingBox";
import { Row, Col, Button } from "react-bootstrap";
import Product from "../components/Product";
import { LinkContainer } from "react-router-bootstrap";

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
        countProducts: action.payload.countProducts,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function SearchView() {
  const navigateTo = useNavigate();
  const { search } = useLocation();
  const searchedParams = new URLSearchParams(search);
  const category = searchedParams.get("category") || "all";
  const query = searchedParams.get("query") || "all";
  const price = searchedParams.get("price") || "all";
  const rating = searchedParams.get("rating") || "all";
  const order = searchedParams.get("order") || "newest";
  const page = searchedParams.get("page") || 1;
  const [categories, setCategories] = useState([]);

  const [{ loading, error, products, pages, countProducts }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
      products: [],
    });

  const prices = [
    { name: "$1 to $50", value: "1-50" },
    { name: "$51 to $200", value: "51-200" },
    { name: "$201 to $1000", value: "201-1000" },
  ];

  const ratings = [
    {
      name: "4stars & up",
      rating: 4,
    },

    {
      name: "3stars & up",
      rating: 3,
    },

    {
      name: "2stars & up",
      rating: 2,
    },

    {
      name: "1stars & up",
      rating: 1,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await apiClient.get(
          `api/products/search?page=${page}&query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}`
        );
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [category, error, order, price, page, query, rating]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await apiClient.get(`/api/products/categories`);
        setCategories(data);
      } catch (error) {
        toast.error(getError(error));
      }
    };
    fetchCategories();
  }, [dispatch]);

  const getFilterUrl = (filter) => {
    const filterCategory = filter.category || category;
    const filterQuery = filter.query || query;
    const filterPrice = filter.price || price;
    const filterRating = filter.rating || rating;
    const filterOrder = filter.order || order;
    const filterPage = filter.page || page;
    return {
      pathname: "/search",
      search: `?page=${filterPage}&query=${filterQuery}&category=${filterCategory}&price=${filterPrice}&rating=${filterRating}&order=${filterOrder}`,
    };
  };

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Search Products</title>
      </Helmet>
      <h1 className="my-3">Search Products</h1>
      <Row>
        <Col md={3}>
          <div>
            <h3>Department</h3>
            <ul>
              <li>
                <Link
                  className={"all" === category ? "text-bold" : ""}
                  to={getFilterUrl({ category: "all" })}
                >
                  Any
                </Link>
              </li>
              {categories.map((mappedCategory) => (
                <li key={mappedCategory}>
                  <Link
                    className={mappedCategory === category ? "text-bold" : ""}
                    to={getFilterUrl({ category: mappedCategory })}
                  >
                    {mappedCategory}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Price</h3>
            <ul>
              <li>
                <Link
                  className={"all" === price ? "text-bold" : ""}
                  to={getFilterUrl({ price: "all" })}
                >
                  Any
                </Link>
              </li>
              {prices.map((mappedPrice) => (
                <li key={mappedPrice.value}>
                  <Link
                    className={mappedPrice.value === price ? "text-bold" : ""}
                    to={getFilterUrl({ price: mappedPrice.value })}
                  >
                    {mappedPrice.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Avg. Costumer Review</h3>
            <ul>
              {ratings.map((mappedRating) => (
                <li key={mappedRating.name}>
                  <Link to={getFilterUrl({ rating: mappedRating.rating })}>
                    <Rating
                      classSpan={
                        `${mappedRating.rating}` === `${rating}`
                          ? "border-bottom border-primary"
                          : ""
                      }
                      rating={mappedRating.rating}
                    />
                  </Link>
                </li>
              ))}
              <li>
                <Link to={getFilterUrl({ rating: "all" })}>
                  <Rating
                    classSpan={
                      `${rating}` === "all"
                        ? "border-bottom border-primary"
                        : ""
                    }
                    rating={0}
                  />
                </Link>
              </li>
            </ul>
          </div>
        </Col>
        <Col md={9}>
          <Row className="justify-content-between mb-3">
            <Col md={6}>
              <div>
                {countProducts === 0 ? "No" : countProducts} Results
                {query !== "all" && " : " + query}
                {category !== "all" && " : " + category}
                {price !== "all" && " : Price " + price}
                {rating !== "all" && " : Rating " + rating + " & up"}
                {query !== "all" ||
                category !== "all" ||
                rating !== "all" ||
                price !== "all" ? (
                  <Button variant="light" onClick={() => navigateTo("/search")}>
                    <i className="fas fa-times-circle"></i>
                  </Button>
                ) : null}
              </div>
            </Col>
            <Col className="text-end">
              Sort by{" "}
              <select
                value={order}
                onChange={(e) => {
                  navigateTo(getFilterUrl({ order: e.target.value }));
                }}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="lowest">Price: Low to High</option>
                <option value="highest">Price: High to Low</option>
                <option value="toprated">Avg. Customer Reviews</option>
              </select>
            </Col>
          </Row>
          {products.length === 0 && <MessageBox>No Product Found</MessageBox>}
          <Row>
            {products.map((product) => (
              <Col sm={6} lg={4} className="mb-3" key={product._id}>
                <Product product={product} />
              </Col>
            ))}
          </Row>
          <div>
            {[...Array(pages).keys()].map((x) => (
              <LinkContainer
                key={x + 1}
                className="mx-1"
                to={getFilterUrl({ page: x + 1 })}
              >
                <Button
                  className={Number(page) === x + 1 ? "text-bold" : ""}
                  variant="light"
                >
                  {x + 1}
                </Button>
              </LinkContainer>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
}
