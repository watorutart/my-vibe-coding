import React, { useState, useRef, useEffect } from 'react';
import type { Pet } from '../types/Pet';
import type { ConversationMessage } from '../types/Conversation';
import './ConversationPanel.css';

interface ConversationPanelProps {
  pet: Pet;
  conversationHistory: ConversationMessage[];
  onSendMessage: (message: string) => void;
  maxMessageLength?: number;
}

const ConversationPanel: React.FC<ConversationPanelProps> = ({
  pet,
  conversationHistory,
  onSendMessage,
  maxMessageLength = 200
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const historyEndRef = useRef<HTMLDivElement>(null);

  // メッセージ履歴の最下部にスクロール
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const handleSendMessage = () => {
    const trimmedMessage = inputMessage.trim();
    if (trimmedMessage) {
      onSendMessage(trimmedMessage);
      setInputMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= maxMessageLength) {
      setInputMessage(value);
    } else {
      setInputMessage(value.slice(0, maxMessageLength));
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className={`conversation-panel mood-${pet.expression}`}
      data-testid="conversation-panel"
    >
      <div className="conversation-header">
        <h3>💬 {pet.name}との会話</h3>
      </div>

      <div 
        className="conversation-history"
        data-testid="conversation-history"
      >
        {conversationHistory.length === 0 ? (
          <div className="welcome-message">
            <p>{pet.name}と会話を始めよう！</p>
          </div>
        ) : (
          conversationHistory.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender}-message`}
            >
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-timestamp">
                {formatTimestamp(new Date(message.timestamp))}
              </div>
            </div>
          ))
        )}
        <div ref={historyEndRef} />
      </div>

      <div className="conversation-input">
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力..."
          className="message-input"
        />
        <button
          onClick={handleSendMessage}
          className="send-button"
          disabled={!inputMessage.trim()}
        >
          送信
        </button>
      </div>

      <div className="character-count">
        {inputMessage.length}/{maxMessageLength}
      </div>
    </div>
  );
};

export default ConversationPanel;
