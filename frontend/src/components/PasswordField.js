import { useRef, useState } from "react";
import { Form } from "react-bootstrap";
import PasswordStrengthBar from "./PasswordStrengthBar";

export default function PasswordField(props) {
  const [passwordShown, setPasswordShown] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  return (
    <Form.Group
      controlId={props.controlId || "password"}
      className={props.spacing}
    >
      <Form.Label>{props.label || "Password"}</Form.Label>
      <div
        ref={wrapRef}
        className="input-group password-wrap"
        style={{ borderRadius: "0.375rem" }}
      >
        <Form.Control
          ref={inputRef}
          value={props.value}
          onChange={props.onChange}
          required={props.required}
          className="password-field"
          isInvalid={!!props.error}
          type={passwordShown ? "text" : "password"}
          style={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            boxShadow: "none",
          }}
          autoComplete="on"
          onFocus={() =>
            (wrapRef.current.style.boxShadow =
              "0 0 0 0.25rem rgba(13,110,253,.25)")
          }
          onBlur={() => (wrapRef.current.style.boxShadow = "none")}
        />
        <div className="input-group-btn">
          <button
            className="btn btn-outline-primary"
            style={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setPasswordShown(!passwordShown);
              inputRef.current.focus();
            }}
            onFocus={() =>
              (wrapRef.current.style.boxShadow =
                "0 0 0 0.25rem rgba(13,110,253,.25)")
            }
            disabled={!props.value || props.value === ""}
          >
            {passwordShown ? (
              <i className="bi bi-eye" />
            ) : (
              <i className="bi bi-eye-slash" />
            )}
          </button>
        </div>
      </div>
      {props.strengthBar && <PasswordStrengthBar password={props.value} />}
      <div
        style={{
          width: "100%",
          fontSize: "0.875em",
          color: "#dc3545",
        }}
      >
        {props.error}
      </div>
    </Form.Group>
  );
}
