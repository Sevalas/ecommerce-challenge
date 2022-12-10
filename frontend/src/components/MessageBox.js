import { Alert } from "react-bootstrap";

export default function MessageBox(props) {
  return <Alert className="text-center" variant={props.variant || "info"}>{props.children}</Alert>;
}
