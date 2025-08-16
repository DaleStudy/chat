import React, { useState, useCallback } from "react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { Message } from "@/types";
import { chatApi } from "@/api";
import { Bot, Users, BookOpen, Calendar, Star } from "lucide-react";

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `안녕하세요! 달레 스터디 AI 챗봇입니다. 👋

저는 달레 스터디 커뮤니티에 대한 모든 정보를 도와드릴 수 있어요.

📚 **도움을 받을 수 있는 것들:**
• 스터디 및 프로젝트 정보
• 참여 방법 및 일정
• FAQ 및 궁금한 점들
• 커뮤니티 활동 안내

아래 빠른 질문 버튼을 사용하거나 자유롭게 질문해보세요!`,
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: "assistant",
        timestamp: new Date(),
        sources: response.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="chat-interface">
      {/* 헤더 */}
      <header className="chat-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-avatar">
              <Bot size={24} />
            </div>
            <div className="header-info">
              <h1>달레 스터디 AI</h1>
              <p>스터디와 프로젝트 정보를 도와드립니다</p>
            </div>
          </div>

          <div className="online-badge">
            <div className="online-dot"></div>
            온라인
          </div>
        </div>
      </header>

      {/* 통계 카드들 */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stats-card">
            <div className="stats-icon">
              <Users size={16} />
            </div>
            <div className="stats-number">5</div>
            <div className="stats-label">진행중인 프로젝트</div>
          </div>

          <div className="stats-card">
            <div className="stats-icon">
              <BookOpen size={16} />
            </div>
            <div className="stats-number">10+</div>
            <div className="stats-label">FAQ 항목</div>
          </div>

          <div className="stats-card">
            <div className="stats-icon">
              <Calendar size={16} />
            </div>
            <div className="stats-number">매주</div>
            <div className="stats-label">정기 모임</div>
          </div>

          <div className="stats-card">
            <div className="stats-icon">
              <Star size={16} />
            </div>
            <div className="stats-number">무료</div>
            <div className="stats-label">참가비</div>
          </div>
        </div>
      </div>

      {/* 메시지 리스트 */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* 채팅 입력 */}
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatInterface;
