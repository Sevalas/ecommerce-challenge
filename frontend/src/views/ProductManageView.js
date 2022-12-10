import { useContext, useEffect, useReducer } from "react";
import { Table } from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import apiClient from "../components/ApiClient";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../context/Store";
import { getError } from "../utils/utils";

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
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, products, pages }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    products: [],
  });

  const { search } = useLocation();
  const page = new URLSearchParams(search).get("page") || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await apiClient.get(`/api/products/admin?page=${page}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [page, userInfo]);

  return (
    <div>
      <h1>Dashboard</h1>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <Table responsive>
            <thead>
              <tr>
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
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div>
            {[...Array(pages).keys()].map((mappedPage) => (
              <Link
                className={mappedPage + 1 === Number(page) ? "text-bold btn" : "btn"}
                key={mappedPage + 1}
                to={`/admin/products?page=${mappedPage + 1}`}
              >
                {mappedPage + 1}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
