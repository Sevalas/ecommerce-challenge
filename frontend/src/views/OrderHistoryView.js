import { useReducer, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { useNavigate } from "react-router-dom";
import apiClient from "../components/ApiClient";
import { getError } from "../utils/utils";
import { Button, Container, Table } from "react-bootstrap";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, orders: action.payload, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function OrderHistoryView() {
  const navigateTo = useNavigate();
  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const { data } = await apiClient.get(`/api/orders/mine`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error) {
        dispatch({ type: "FETCH_REQUEST", payload: getError(error) });
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Helmet>
        <title>Order History</title>
      </Helmet>
      <h1 className="my-3">Order History</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Container fluid>
          <Table responsive>
            <thead>
              <tr>
                <th>ACTIONS</th>
                <th>ID</th>
                <th>DATE</th>
                <th>DELIVERED</th>
                <th>PAID</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <Button
                      type="button"
                      variant="dark"
                      onClick={() => {
                        navigateTo(`/order/${order._id}`);
                      }}
                    >
                      Details
                    </Button>
                  </td>
                  <td>{order._id}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>
                    {order.status.isDelivered
                      ? order.status.deliveredAt.substring(0, 10)
                      : "No"}
                  </td>
                  <td>
                    {order.status.isPaid
                      ? order.status.paidAt.substring(0, 10)
                      : "No"}
                  </td>
                  <td>{order.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>
      )}
    </div>
  );
}
