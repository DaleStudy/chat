import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickQuestions = [
    "달레 스터디 참여 방법",
    "현재 진행 중인 프로젝트",
    "참가비가 있나요?",
    "초보자도 참여 가능한가요?",
  ];

  const handleQuickQuestion = (question: string) => {
    onSendMessage(question);
  };

  return (
    <div className="chat-input-container">
      {/* 빠른 질문 버튼들 */}
      {!message && (
        <div className="quick-questions">
          <div className="quick-questions-title">자주 묻는 질문:</div>
          <div className="quick-questions-grid">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                disabled={disabled}
                className="quick-question-btn"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 메시지 입력 폼 */}
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-row">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="달레 스터디에 대해 궁금한 것을 물어보세요..."
            disabled={disabled}
            className="input-field"
          />

          <div className="input-buttons">
            <button type="button" disabled={disabled} className="icon-btn">
              <Paperclip size={16} />
            </button>

            <button type="button" disabled={disabled} className="icon-btn">
              <Smile size={16} />
            </button>

            <button
              type="submit"
              disabled={disabled || !message.trim()}
              className="send-btn"
            >
              <Send size={16} />
              전송
            </button>
          </div>
        </div>

        <div className="input-help">Enter로 전송, Shift+Enter로 줄바꿈</div>
      </form>
    </div>
  );
};

export default ChatInput;
