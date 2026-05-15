import React, { useState, useRef, useEffect } from 'react';

const ChatWindow = ({
  user,
  messages,
  translatedMessages,
  aiInsights,
  features
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, translatedMessages]);

  // SEND MESSAGE
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      await fetch('http://127.0.0.1:5000/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          sender: 'agent',
          text: newMessage
        })
      });

      setNewMessage('');

    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  // SENTIMENT FEATURE
  const isSentimentEnabled =
    features?.find(
      f => f.name === 'Sentiment Detection'
    )?.enabled;

  const currentEmotion =
    isSentimentEnabled
      ? aiInsights?.emotion
      : null;

  const showFrustration =
    currentEmotion === 'frustrated';

  const showConfused =
    currentEmotion === 'confused';

  const showPositive =
    currentEmotion === 'positive';

  // TRANSLATION FEATURE
  const translationFeature =
    features?.find(
      f => f.name === 'Translation'
    );

  const isTranslationEnabled =
    translationFeature?.enabled;

  const displayMessages =
    isTranslationEnabled &&
    translatedMessages?.length > 0
      ? translatedMessages
      : messages;

  return (
    <div
      className="panel chat-window"
      style={{
        flex: '0 1 44%',
        minWidth: '360px'
      }}
    >

      {/* EMOTION BANNER */}
      {isSentimentEnabled ? (
        <>
          {showFrustration && (
            <div className="emotion-banner emotion-banner-alert">
              ⚠️ High frustration detected - showing priority help options
            </div>
          )}

          {showConfused && (
            <div className="emotion-banner emotion-banner-info">
              ℹ️ Confusion detected - providing step-by-step guidance
            </div>
          )}

          {showPositive && (
            <div className="emotion-banner emotion-banner-positive">
              ✓ Positive interaction - continuing support
            </div>
          )}
        </>
      ) : (
        <div
          className="emotion-banner"
          style={{
            background: '#f1f3f5',
            color: '#888'
          }}
        >
          Sentiment Detection Disabled
        </div>
      )}

      {/* CHAT MESSAGES */}
      <div className="message-container">
        {displayMessages.map(msg => (
          <div
            key={msg.id}
            className={`message ${msg.sender}`}
          >
            <div>{msg.text}</div>

            <div className="message-time">
              {msg.timestamp}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* HELP PANEL */}
      {isSentimentEnabled &&
        showFrustration && (
        <div className="help-panel">
          <div className="help-title">
            How can we help?
          </div>

          <div className="quick-actions">
            <button className="action-button">
              Track Order
            </button>

            <button className="action-button">
              Talk to Supervisor
            </button>

            <button className="action-button">
              Raise Ticket
            </button>

            <button className="action-button">
              Get Refund
            </button>
          </div>
        </div>
      )}

      {/* INPUT */}
      <div className="input-area">
        <textarea
          className="input-field"
          placeholder="Reply to customer..."
          value={newMessage}
          onChange={(e) =>
            setNewMessage(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              !e.shiftKey
            ) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />

        <button
          className="send-button"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;