import { Spinner } from "react-bootstrap";

export default function LoadingBox() {
  return (
    <div className="full-page-spinner">
      <Spinner animation="border" variant="primary" role="statux">
      <span className="visually-hidden">Loading..</span>
    </Spinner>
    </div>
  );
}