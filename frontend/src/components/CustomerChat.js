import React, { useEffect, useState, useRef } from 'react';
import socket from '../socket';

const CustomerChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/users");
      const data = await res.json();

      setUsers(data);

      if (!selectedUser && data.length > 0) {
        setSelectedUser(data[0]);
      }

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!selectedUser) return;

    fetch(`http://127.0.0.1:5000/messages/${selectedUser.id}`)
      .then(res => res.json())
      .then(data => setMessages(data));

  }, [selectedUser]);

  useEffect(() => {
    const handler = (data) => {
      setUsers(prev =>
        prev.map(u =>
          u.id === data.user_id
            ? {
                ...u,
                lastMessage: data.message.text,
                emotion: data.insights?.emotion || u.emotion
              }
            : u
        )
      );

      if (selectedUser?.id !== data.user_id) return;

      setMessages(prev => {
        if (prev.find(m => m.id === data.message.id)) {
          return prev;
        }

        return [...prev, data.message];
      });
    };

    socket.on("new_message", handler);

    return () => socket.off("new_message", handler);

  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await fetch("http://127.0.0.1:5000/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          sender: "customer",
          text: newMessage
        })
      });

      setNewMessage("");

    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) return;

    try {
      const res = await fetch("http://127.0.0.1:5000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newCustomerName
        })
      });

      const newUser = await res.json();

      setUsers(prev => [...prev, newUser]);
      setSelectedUser(newUser);
      setNewCustomerName("");

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="customer-dashboard">

      <div className="panel customer-sidebar">
        <div className="customer-sidebar-header">
          Customers
        </div>

        <div className="customer-add-box">
          <input
            type="text"
            placeholder="Enter customer name..."
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddCustomer();
              }
            }}
          />

          <button onClick={handleAddCustomer}>
            Add
          </button>
        </div>

        <div className="customer-list">
          {users.map(user => (
            <div
              key={user.id}
              className={`customer-list-item ${
                selectedUser?.id === user.id ? 'active' : ''
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="customer-avatar">
                👤
              </div>

              <div className="customer-meta">
                <div className="customer-name">
                  {user.name}
                </div>

                <div className="customer-preview">
                  {user.lastMessage || "No messages yet"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            className="customer-send-btn"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>

    </div>
  );
};

export default CustomerChat;