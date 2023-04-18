import { useEffect, useRef, useState } from "react";
import { PASSWORD_REGEX } from "../constants/Constants";

export default function PasswordStrengthBar({ password }) {
  const defautlBarStyle = {
    flexBasis: "0px",
    flexGrow: "1",
    position: "relative",
    maxWidth: "100%",
    width: "100%",
    height: "2px",
    backgroundColor: "#ddd",
    marginRight: "4px",
  };
  const firstBar = useRef(null);
  const secondBar = useRef(null);
  const thirdBar = useRef(null);
  const [label, setLabel] = useState("Too Short");

  useEffect(() => {
    if (password && password.length >= 8) {
      thirdBar.current.style.background = "#ddd";
      secondBar.current.style.background = "#ddd";
      firstBar.current.style.background = "#ef4836";
      setLabel("Weak");
      if (PASSWORD_REGEX.test(password)) {
        thirdBar.current.style.background = "#ddd";
        secondBar.current.style.background = "#2b90ef";
        firstBar.current.style.background = "#2b90ef";
        setLabel("Good");
        if (password.length >= 12) {
          thirdBar.current.style.background = "#25c281";
          secondBar.current.style.background = "#25c281";
          firstBar.current.style.background = "#25c281";
          setLabel("Strong");
        }
        return;
      }
      return;
    }
    thirdBar.current.style.background = "#ddd";
    secondBar.current.style.background = "#ddd";
    firstBar.current.style.background = "#ddd";
    setLabel("Too Short");
  }, [password]);

  return (
    <div className="mt-2" style={{ position: "relative" }}>
      <div
        style={{ display: "flex", alignItems: "center", margin: "5px 0px 0px" }}
      >
        <div ref={firstBar} style={defautlBarStyle} />
        <div ref={secondBar} style={defautlBarStyle} />
        <div ref={thirdBar} style={defautlBarStyle} />
      </div>
      <p
        style={{
          margin: "5px 0px 0px",
          color: "rgb(137, 135, 146)",
          fontSize: "14px",
          textAlign: "right",
        }}
      >
        {label}
      </p>
    </div>
  );
}
