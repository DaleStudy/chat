import React, { useRef, useEffect } from "react";
import { Message } from "@/types";
import { Clock, User, Bot } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return "오늘";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "어제";
    }

    return messageDate.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="message-list">
      {messages.map((message, index) => {
        const isUser = message.role === "user";
        const showDate =
          index === 0 ||
          formatDate(message.timestamp) !==
            formatDate(messages[index - 1]?.timestamp);

        return (
          <div key={message.id} className="message-container">
            {showDate && (
              <div className="date-divider">
                <span className="date-badge">
                  {formatDate(message.timestamp)}
                </span>
              </div>
            )}

            <div className={`message-row ${isUser ? "user" : "assistant"}`}>
              <div className="message-content">
                {!isUser && (
                  <div className="message-avatar assistant">
                    <Bot size={12} />
                  </div>
                )}

                <div
                  className={`message-bubble ${isUser ? "user" : "assistant"}`}
                >
                  <div className="message-text">{message.content}</div>

                  {message.sources && message.sources.length > 0 && (
                    <div className="message-sources">
                      <div className="sources-title">참고 자료:</div>
                      <div>
                        {message.sources.slice(0, 2).map((source, idx) => (
                          <div key={idx} className="source-item">
                            <span className="source-title">{source.title}</span>
                            {source.type && (
                              <span className="source-badge">
                                {source.type === "project" ? "프로젝트" : "FAQ"}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={`message-time ${isUser ? "user" : "assistant"}`}
                >
                  <Clock size={12} />
                  {formatTime(message.timestamp)}
                </div>
              </div>

              {isUser && (
                <div className="message-avatar user">
                  <User size={12} />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="message-container">
          <div className="message-row assistant">
            <div className="message-content">
              <div className="message-avatar assistant">
                <Bot size={12} />
              </div>

              <div className="message-bubble assistant">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
