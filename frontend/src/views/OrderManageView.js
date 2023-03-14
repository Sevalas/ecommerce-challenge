import { useEffect, useReducer, useState } from "react";
import apiClient from "../components/ApiClient";
import { getError } from "../utils/utils";
import { Button, Container, Modal, Table } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import toast from "react-hot-toast";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        orders: action.payload.orders,
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

export default function OrderManageView() {
  const navigateTo = useNavigate();
  const [refresh, setRefresh] = useState(true);
  const { search } = useLocation();
  const pageParam = new URLSearchParams(search).get("page");
  const page = !pageParam || pageParam < 1 ? 1 : pageParam;
  const [{ loading, error, orders, pages }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    orders: [],
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await apiClient.get(`/api/orders/admin?page=${page}`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
        setRefresh(false);
        if (page > data.pages) {
          navigateTo(`?page=${data.pages}`);
        }
      } catch (error) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(error),
        });
        setRefresh(false);
      }
    };
    fetchData();
  }, [navigateTo, page, refresh]);

  const handleShowDeleteModal = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const deleteHandler = async () => {
    const deleteOrder = async () => {
      await apiClient.delete(`/api/orders/${orderToDelete}`);
    };
    await toast.promise(deleteOrder(), {
      loading: "Deleting order...",
      success: () => {
        handleCloseDeleteModal();
        setRefresh(true);
        return <b>Order deleted successfully</b>;
      },
      error: (error) => `Error: ${getError(error)}`,
    });
  };

  return (
    <div>
      <Helmet>
        <title>Orders</title>
      </Helmet>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Container fluid>
          <h1>Orders</h1>
          <Table responsive>
            <thead>
              <tr>
                <th>ACTIONS</th>
                <th>ID</th>
                <th>USER</th>
                <th>DATE</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <div className="d-flex">
                      <Button
                        type="button"
                        variant="dark"
                        onClick={() => {
                          navigateTo(`/order/${order._id}`);
                        }}
                      >
                        Details
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="mx-1"
                        onClick={() => handleShowDeleteModal(order._id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                  <td>{order._id}</td>
                  <td>{order.user ? order.user.name : "DELETED USER"}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>
                    {order.status.isPaid && order.status.paidAt
                      ? order.status.paidAt.substring(0, 10)
                      : "No"}
                  </td>
                  <td>
                    {order.status.isDelivered && order.status.deliveredAt
                      ? order.status.deliveredAt.substring(0, 10)
                      : "No"}
                  </td>
                  <td>${order.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div>
            {[...Array(pages).keys()].map((mappedPage) => (
              <Link
                className={
                  mappedPage + 1 === Number(page) ? "text-bold btn" : "btn"
                }
                key={mappedPage + 1}
                to={`/admin/orders?page=${mappedPage + 1}`}
              >
                {mappedPage + 1}
              </Link>
            ))}
          </div>
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
      )}
    </div>
  );
}
