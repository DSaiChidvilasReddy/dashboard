import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

import ConversationList from './components/ConversationList.js';
import ChatWindow from './components/ChatWindow.js';
import AIInsights from './components/AIInsights.js';
import EmotionShowcase from './components/EmotionShowcase.js';
import FeatureTogglePanel from './components/FeatureTogglePanel.js';
import ImpactComparison from './components/ImpactComparison.js';
import ImpactAnalysis from './components/ImpactAnalysis.js';
import CustomerChat from './components/CustomerChat.js';

import { translateMessages } from "./api";
import { getUsers, getMessages } from './api';
import socket from './socket';

const STORAGE_KEYS = {
  ACTIVE_TAB: "app_active_tab",
  VIEW_MODE: "app_view_mode",
  FEATURES: "app_features",
  SELECTED_USER: "app_selected_user"
};

const DEFAULT_FEATURES = [
  { id: 1, name: 'Sentiment Detection', enabled: true, description: '' },
  { id: 2, name: 'Translation', enabled: false, description: '', config: {} },
  { id: 3, name: 'Smart Suggestions', enabled: true, description: '' },
  { id: 4, name: 'Auto Summarization', enabled: false, description: '' },
  { id: 5, name: 'Keyword Extraction', enabled: true, description: '' }
];

function App() {
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) || 'case1'
  );

  const [viewMode, setViewMode] = useState(
    localStorage.getItem(STORAGE_KEYS.VIEW_MODE) || 'agent'
  );

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [translatedMessages, setTranslatedMessages] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);

  const [features, setFeatures] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FEATURES);

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_FEATURES;
      }
    }

    return DEFAULT_FEATURES;
  });

  const aiDebounceRef = useRef(null);
  const translationDebounceRef = useRef(null);
  const latestTranslationRequestRef = useRef(0);

  // SAVE UI STATE
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.FEATURES,
      JSON.stringify(features)
    );
  }, [features]);

  useEffect(() => {
    if (selectedUser?.id) {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_USER,
        selectedUser.id
      );
    }
  }, [selectedUser]);

  // LOAD USERS
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);

        const savedUserId = Number(
          localStorage.getItem(STORAGE_KEYS.SELECTED_USER)
        );

        if (savedUserId) {
          const existingUser = data.find(
            u => u.id === savedUserId
          );

          if (existingUser) {
            setSelectedUser(existingUser);
            return;
          }
        }

        if (data.length > 0) {
          setSelectedUser(data[0]);
        }

      } catch (err) {
        console.error("User load error:", err);
      }
    };

    loadUsers();
  }, []);

  // LOAD CHAT
  useEffect(() => {
    if (!selectedUser) return;

    const loadMessages = async () => {
      try {
        const data = await getMessages(selectedUser.id);
        setMessages(data);
      } catch (err) {
        console.error("Message load error:", err);
      }
    };

    loadMessages();
  }, [selectedUser]);

  // SOCKET LISTENER
  useEffect(() => {
    const handler = (data) => {
      if (!selectedUser) return;

      if (data.insights?.emotion) {
        setUsers(prev =>
          prev.map(u =>
            u.id === data.user_id
              ? {
                  ...u,
                  emotion: data.insights.emotion,
                  lastMessage: data.message.text
                }
              : u
          )
        );
      }

      if (data.user_id !== selectedUser.id) return;

      const msg = data.message;

      setMessages(prev => {
        const exists = prev.some(
          m => m.id === msg.id
        );

        if (exists) return prev;

        return [...prev, msg];
      });

      if (data.insights) {
        setAiInsights(data.insights);
      }
    };

    socket.on("new_message", handler);

    return () => {
      socket.off("new_message", handler);
    };

  }, [selectedUser]);

  // OPTIMIZED AI ANALYSIS
  useEffect(() => {
    if (!selectedUser || messages.length === 0) return;

    if (aiDebounceRef.current) {
      clearTimeout(aiDebounceRef.current);
    }

    aiDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          'http://127.0.0.1:5000/chat',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: selectedUser.id,
              conversation: messages,
              features
            })
          }
        );

        const data = await res.json();

        setAiInsights(data.insights);

        if (data.insights?.emotion) {
          setUsers(prev =>
            prev.map(u =>
              u.id === selectedUser.id
                ? {
                    ...u,
                    emotion: data.insights.emotion
                  }
                : u
            )
          );
        }

      } catch (err) {
        console.error("AI error:", err);
      }
    }, 700);

    return () => {
      if (aiDebounceRef.current) {
        clearTimeout(aiDebounceRef.current);
      }
    };

  }, [messages, selectedUser, features]);

  // OPTIMIZED TRANSLATION
  useEffect(() => {
    const translationFeature = features.find(
      f => f.name === "Translation"
    );

    const isEnabled = translationFeature?.enabled;
    const language = translationFeature?.config?.language;

    if (!isEnabled) {
      setTranslatedMessages([]);
      return;
    }

    if (!language?.trim()) {
      return;
    }

    if (messages.length === 0) {
      setTranslatedMessages([]);
      return;
    }

    if (translationDebounceRef.current) {
      clearTimeout(translationDebounceRef.current);
    }

    translationDebounceRef.current = setTimeout(async () => {
      try {
        const requestId = ++latestTranslationRequestRef.current;

        const res = await translateMessages(
          messages,
          language
        );

        if (
          requestId !==
          latestTranslationRequestRef.current
        ) {
          return;
        }

        setTranslatedMessages(res.messages);

      } catch (err) {
        console.error("Translation error:", err);
      }
    }, 500);

    return () => {
      if (translationDebounceRef.current) {
        clearTimeout(translationDebounceRef.current);
      }
    };

  }, [
    messages,
    features.find(f => f.name === "Translation")?.enabled,
    features.find(f => f.name === "Translation")?.config?.language
  ]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setMessages([]);
    setTranslatedMessages([]);
    setAiInsights(null);
  };

  const handleToggleFeature = (
    featureId,
    configUpdate = null
  ) => {
    setFeatures(prev =>
      prev.map(f => {
        if (f.id !== featureId) {
          return f;
        }

        if (configUpdate) {
          return {
            ...f,
            enabled: true,
            config: {
              ...f.config,
              ...configUpdate
            }
          };
        }

        return {
          ...f,
          enabled: !f.enabled
        };
      })
    );
  };

  if (viewMode === "customer") {
    return (
      <div className="app">
        <div className="header">
          <h1>AI Chat Dashboard</h1>

          <div className="tabs">
            <button
              className="tab"
              onClick={() => setViewMode("agent")}
            >
              Agent Dashboard
            </button>
          </div>
        </div>

        <CustomerChat />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>AI Chat Dashboard</h1>

        <div className="tabs">
          <button
            className={`tab ${
              activeTab === 'case1'
                ? 'active'
                : ''
            }`}
            onClick={() => setActiveTab('case1')}
          >
            Chats
          </button>

          <button
            className={`tab ${
              activeTab === 'case2'
                ? 'active'
                : ''
            }`}
            onClick={() => setActiveTab('case2')}
          >
            Feature Settings
          </button>

          <button
            className="tab"
            onClick={() => setViewMode("customer")}
          >
            Customer Simulation
          </button>
        </div>
      </div>

      <div className="main-container">
        {activeTab === 'case1' && selectedUser && (
          <>
            <ConversationList
              users={users}
              selectedUser={selectedUser}
              onSelectUser={handleSelectUser}
            />

            <ChatWindow
              user={selectedUser}
              messages={messages}
              translatedMessages={translatedMessages}
              aiInsights={aiInsights}
              features={features}
            />

            <AIInsights
              features={features}
              insights={aiInsights}
            />

            <EmotionShowcase
              currentEmotion={aiInsights?.emotion}
            />
          </>
        )}

        {activeTab === 'case2' && (
          <>
            <FeatureTogglePanel
              features={features}
              onToggleFeature={handleToggleFeature}
            />

            <ImpactComparison
              features={features}
            />

            <ImpactAnalysis
              features={features}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;