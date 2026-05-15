import React from 'react';
import { emotionEmojis } from '../emoji';

const ConversationList = ({ users, selectedUser, onSelectUser }) => {
  return (
    <div className="panel conversation-panel" style={{ flex: '0 1 20%', minWidth: '220px' }}>
      <h3 style={{ marginBottom: '15px', color: '#212529' }}>Conversations</h3>
      <div className="conversation-list">
        {users.map(user => (
          <div
            key={user.id}
            className={`conversation-item ${selectedUser?.id === user.id ? 'active' : ''}`}
            onClick={() => onSelectUser(user)}
          >
            <div className="conversation-header">
              <span className="user-name">{user.avatar} {user.name}</span>
              <span className="emotion-badge">
                {emotionEmojis[user.emotion]}
              </span>
            </div>
            <div className="last-message">{user.lastMessage}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
