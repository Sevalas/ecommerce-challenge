import { useContext, useEffect, useRef, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import MessageBox from "../components/MessageBox";
import { Store } from "../context/Store";
import socketIOClient from "socket.io-client";
import { toast } from "react-hot-toast";

let allUsers = [];
let allMessages = [];
let allSelectedUser = {};
const ENDPOINT =
  window.location.host.indexOf("localhost") >= 0
    ? "http://127.0.0.1:5000"
    : window.location.host;

export default function SupportView() {
  const [selectedUser, setSelectedUser] = useState({});
  const [socket, setSocket] = useState(null);
  const [form, setForm] = useState({});
  const [errorsForm, setErrorsForm] = useState({});
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const uiMessagesRef = useRef(null);
  const { state } = useContext(Store);
  const { userInfo } = state;

  const setField = (field, value) => {
    setForm({ ...form, [field]: value });
    if (!!errorsForm[field]) {
      setErrorsForm({ ...errorsForm, [field]: null });
    }
  };

  useEffect(() => {
    if (uiMessagesRef.current) {
      uiMessagesRef.current.scrollBy({
        top: uiMessagesRef.current.clientHeight,
        left: 0,
        behavior: "smooth",
      });
    }

    if (!socket) {
      const sk = socketIOClient(ENDPOINT);
      setSocket(sk);
      sk.emit("onLogin", {
        _id: userInfo._id,
        name: userInfo.name,
        isAdmin: userInfo.isAdmin,
      });
      sk.on("message", (data) => {
        if (allSelectedUser._id === data._id) {
          allMessages = [...allMessages, data];
        } else {
          const existUser = allUsers.find((user) => user._id === data._id);
          if (existUser) {
            allUsers = allUsers.map((user) =>
              user._id === existUser._id ? { ...user, unread: true } : user
            );
            setUsers(allUsers);
          }
        }
        setMessages(allMessages);
      });
      sk.on("updateUser", (updatedUser) => {
        const existUser = allUsers.find((user) => user._id === updatedUser._id);
        if (existUser) {
          allUsers = allUsers.map((user) =>
            user._id === existUser._id ? updatedUser : user
          );
          setUsers(allUsers);
        } else {
          allUsers = [...allUsers, updatedUser];
          setUsers(allUsers);
        }
      });
      sk.on("listUsers", (updatedUsers) => {
        allUsers = updatedUsers;
        setUsers(allUsers);
      });
      sk.on("selectUser", (user) => {
        allMessages = user.messages;
        setMessages(allMessages);
        console.log(messages);
      });
    }
  }, [messages, socket, users, userInfo]);

  const selectUser = (e, user) => {
    e.preventDefault();
    allSelectedUser = user;
    setSelectedUser(allSelectedUser);
    const existUser = allUsers.find((x) => x._id === user._id);
    if (existUser) {
      allUsers = allUsers.map((x) =>
        x._id === existUser._id ? { ...x, unread: false } : x
      );
      setUsers(allUsers);
    }
    socket.emit("onUserSelected", user);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!form.messageBody.trim()) {
      toast.error("Please type message.");
    } else {
      allMessages = [
        ...allMessages,
        { body: form.messageBody, name: userInfo.name },
      ];
      setMessages(allMessages);
      setField("messageBody", "");
      setTimeout(() => {
        socket.emit("onMessage", {
          body: form.messageBody,
          name: userInfo.name,
          isAdmin: userInfo.isAdmin,
          _id: selectedUser._id,
        });
      }, 1000);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Support</title>
      </Helmet>
      <Container>
        <h1 className="mb-4">Support</h1>
        <Row className="support-users">
          <Col md={4} className="user-select">
            {users.filter((user) => user._id !== userInfo._id).length === 0 ? (
              <MessageBox>No online users found</MessageBox>
            ) : (
              <div>
                <strong>Select a user to chat</strong>
                <ul>
                  {users
                    .filter((filterUser) => filterUser._id !== userInfo._id)
                    .map((user) => (
                      <li
                        key={user._id}
                        className={
                          user._id === selectedUser._id ? "selected" : ""
                        }
                      >
                        <div className="d-flex my-1">
                          <div
                            className={
                              user.unread
                                ? "status unread"
                                : user.online
                                ? "status online"
                                : "status offline"
                            }
                          />
                          <Button
                            className="ms-2"
                            type="button"
                            onClick={(e) => selectUser(e, user)}
                          >
                            {user.name}
                          </Button>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </Col>
          <Col md={8} className="support-messages">
            {!selectedUser._id ? (
              <MessageBox>Select a user to start chat</MessageBox>
            ) : (
              <div>
                <strong>Chat with {selectedUser.name}</strong>
                <ul ref={uiMessagesRef}>
                  {messages.length === 0 ? (
                    <li>No message</li>
                  ) : (
                    <div>
                      {messages.map((msg, index) => (
                        <li key={index}>
                          <strong>{`${msg.name}: `}</strong>
                          {msg.body}
                        </li>
                      ))}
                    </div>
                  )}
                </ul>
                <div>
                  <Form onSubmit={submitHandler}>
                    <Form.Group controlId="messageBody">
                      <Form.Control
                        value={form.messageBody}
                        onChange={(event) =>
                          setField("messageBody", event.target.value)
                        }
                        isInvalid={!!errorsForm.messageBody}
                        autoFocus={true}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errorsForm.messageBody}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <div className="mt-2 d-flex justify-content-end">
                      <Button type="submit">Send</Button>
                    </div>
                  </Form>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
