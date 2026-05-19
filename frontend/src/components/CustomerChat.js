import React, {
  useEffect,
  useState,
  useRef
} from 'react';

import socket from '../socket';
import {
  getUsers,
  getMessages,
  sendMessage
} from '../api';

const CustomerChat = () => {
  const [users, setUsers] =
    useState([]);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [newMessage, setNewMessage] =
    useState('');

  const [newCustomerName, setNewCustomerName] =
    useState('');

  const [isSending, setIsSending] =
    useState(false);

  const [isAddingCustomer, setIsAddingCustomer] =
    useState(false);

  const messagesEndRef = useRef(null);

  // LOAD USERS
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();

      setUsers(data);

      if (!selectedUser && data.length > 0) {
        setSelectedUser(data[0]);
      }

    } catch (err) {
      console.error(
        "Load users error:",
        err
      );
    }
  };

  // LOAD CHAT
  useEffect(() => {
    if (!selectedUser) return;

    const loadChat = async () => {
      try {
        const data = await getMessages(
          selectedUser.id
        );

        setMessages(data);

      } catch (err) {
        console.error(
          "Load chat error:",
          err
        );
      }
    };

    loadChat();

  }, [selectedUser]);

  // SOCKET
  useEffect(() => {
    const handler = (data) => {
      setUsers(prev =>
        prev.map(u =>
          u.id === data.user_id
            ? {
                ...u,
                lastMessage:
                  data.message.text,
                emotion:
                  data.insights?.emotion ||
                  u.emotion
              }
            : u
        )
      );

      if (
        selectedUser?.id !==
        data.user_id
      ) {
        return;
      }

      setMessages(prev => {
        const exists = prev.some(
          m =>
            m.id ===
            data.message.id
        );

        if (exists) {
          return prev;
        }

        return [
          ...prev,
          data.message
        ];
      });
    };

    socket.on("new_message", handler);

    return () => {
      socket.off(
        "new_message",
        handler
      );
    };

  }, [selectedUser]);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  // SEND MESSAGE
  const handleSend = async () => {
    if (
      !newMessage.trim() ||
      !selectedUser ||
      isSending
    ) {
      return;
    }

    const text = newMessage.trim();

    setIsSending(true);

    try {
      await sendMessage({
        user_id: selectedUser.id,
        sender: "customer",
        text
      });

      setNewMessage("");

    } catch (err) {
      console.error(
        "Send message error:",
        err
      );

    } finally {
      setIsSending(false);
    }
  };

  // ADD CUSTOMER
  const handleAddCustomer = async () => {
    if (
      !newCustomerName.trim() ||
      isAddingCustomer
    ) {
      return;
    }

    setIsAddingCustomer(true);

    try {
      const res = await fetch(
        "http://127.0.0.1:5000/users",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            name: newCustomerName.trim()
          })
        }
      );

      const newUser =
        await res.json();

      setUsers(prev => [
        ...prev,
        newUser
      ]);

      setSelectedUser(newUser);

      setNewCustomerName("");

    } catch (err) {
      console.error(
        "Add customer error:",
        err
      );

    } finally {
      setIsAddingCustomer(false);
    }
  };

  return (
    <div className="customer-dashboard">
      {/* LEFT */}
      <div className="panel customer-sidebar">
        <div className="customer-sidebar-header">
          Customers
        </div>

        <div className="customer-add-box">
          <input
            type="text"
            placeholder="Enter customer name..."
            value={newCustomerName}
            disabled={isAddingCustomer}
            onChange={(e) =>
              setNewCustomerName(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter"
              ) {
                handleAddCustomer();
              }
            }}
          />

          <button
            onClick={
              handleAddCustomer
            }
            disabled={
              isAddingCustomer ||
              !newCustomerName.trim()
            }
          >
            {isAddingCustomer
              ? "Adding..."
              : "Add"}
          </button>
        </div>

        <div className="customer-list">
          {users.map(user => (
            <div
              key={user.id}
              className={`customer-list-item ${
                selectedUser?.id ===
                user.id
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setSelectedUser(
                  user
                )
              }
            >
              <div className="customer-avatar">
                👤
              </div>

              <div className="customer-meta">
                <div className="customer-name">
                  {user.name}
                </div>

                <div className="customer-preview">
                  {user.lastMessage ||
                    "No messages yet"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="panel customer-chat-panel">
        <div className="customer-message-container">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`customer-message-bubble ${msg.sender}`}
            >
              <div>{msg.text}</div>

              <div className="message-time">
                {msg.timestamp}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="customer-input-area">
          <textarea
            className="customer-input"
            placeholder="Type your message..."
            value={newMessage}
            disabled={isSending}
            onChange={(e) =>
              setNewMessage(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            className="customer-send-btn"
            onClick={handleSend}
            disabled={
              isSending ||
              !newMessage.trim()
            }
          >
            {isSending
              ? "Sending..."
              : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerChat;