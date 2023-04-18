import { Form } from "react-bootstrap";

export default function EmailField(props) {
  return (
    <Form.Group
      controlId={props.controlId || "email"}
      className={props.spacing}
    >
      <Form.Label>{props.label || "Email"}</Form.Label>
      <Form.Control
        type="email"
        value={props.value}
        onChange={props.onChange}
        required={props.required}
        isInvalid={!!props.error}
      />
      <Form.Control.Feedback type="invalid">
        {props.error}
      </Form.Control.Feedback>
    </Form.Group>
  );
}
