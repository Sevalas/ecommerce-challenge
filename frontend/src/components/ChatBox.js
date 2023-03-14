import { useEffect, useRef, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { toast } from "react-hot-toast";
import socketIOClient from "socket.io-client";

const ENDPOINT =
  window.location.host.indexOf("localhost") >= 0
    ? "http://127.0.0.1:5000"
    : window.location.host;

export default function ChatBox(props) {
  const { userInfo } = props;
  const [socket, setSocket] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const uiMessagesRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      name: "admin",
      body: "Hello there, please ask your question.",
    },
  ]);

  useEffect(() => {
    if (uiMessagesRef.current) {
      uiMessagesRef.current.scrollBy({
        top: uiMessagesRef.current.clientHeight,
        left: 0,
        behavior: "smooth",
      });
    }
    if (socket) {
      socket.emit("onLogin", {
        _id: userInfo._id,
        name: userInfo.name,
        isAdmin: userInfo.isAdmin,
      });
      socket.on("message", (data) => {
        setMessages([...messages, { body: data.body, name: data.name }]);
      });
    }
  }, [messages, isOpen, socket, userInfo]);

  const supportHandler = () => {
    setIsOpen(true);
    const sk = socketIOClient(ENDPOINT);
    setSocket(sk);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      toast.error("Please type message.");
    } else {
      setMessages([...messages, { body: messageBody, name: userInfo.name }]);
      setMessageBody("");
      setTimeout(() => {
        socket.emit("onMessage", {
          body: messageBody,
          name: userInfo.name,
          isAdmin: userInfo.isAdmin,
          _id: userInfo._id,
        });
      }, 1000);
    }
  };

  const closeHandler = () => {
    setIsOpen(false);
  };

  return (
    <div className="chatbox">
      {!isOpen ? (
        <Button type="button" className="open-button" onClick={supportHandler}>
          <i className="fa-regular fa-circle-question" />
        </Button>
      ) : (
        <div>
          <Card>
            <div className="d-flex py-2 px-3">
              <strong className="flex-grow-1 align-self-center">Support</strong>
              <Button type="button" onClick={closeHandler}>
                <i className="fa fa-close" />
              </Button>
            </div>
            <Card.Body>
              <div className="body-box mb-3" ref={uiMessagesRef}>
                {messages.map((msg, index) => (
                  <li key={index}>
                    <span>
                      <strong>{`${msg.name}: `}</strong>
                      {msg.body}
                    </span>
                  </li>
                ))}
              </div>
              <div>
                <Form onSubmit={submitHandler}>
                  <Form.Group controlId="messageBody">
                    <Form.Control
                      value={messageBody}
                      onChange={(event) => setMessageBody(event.target.value)}
                      autoFocus={true}
                    />
                  </Form.Group>
                  <div className="mt-2 d-flex justify-content-end">
                    <Button type="submit">Send</Button>
                  </div>
                </Form>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}
