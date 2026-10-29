import { ChatResponse } from '@/types';
import { chatCompletion, isLLMError } from '@/services/llmService';
import { PROMPTS } from '@/utils/prompts';
import { SearchService } from '@/services/searchService';

// 자주 묻는 질문에 대한 미리 정의된 답변
const predefinedAnswers: Record<string, ChatResponse> = {
  "달레 스터디 참여 방법": {
    message:
      "달레 스터디에 참여하시려면:\n\n1. 웹사이트에서 관심 있는 스터디를 선택하세요\n2. 신청서를 작성하여 제출하세요\n3. 신청서 검토 후 개별 연락을 드립니다\n4. 스터디 시작 전 오리엔테이션에 참석하세요\n\n자세한 내용은 각 스터디 페이지에서 확인하실 수 있습니다.",
    sources: [],
  },
  "현재 진행 중인 프로젝트": {
    message:
      "현재 진행 중인 스터디 프로젝트들:\n\n• 인공지능 스터디\n• 리트코드 스터디\n• 영어 면접 스터디\n• 달레 디자인 시스템\n\n각 프로젝트의 자세한 정보는 프로젝트 페이지에서 확인하실 수 있습니다.",
    sources: [],
  },
  "참가비가 있나요?": {
    message:
      "대부분의 스터디는 무료로 진행됩니다.\n\n일부 프로젝트의 경우 서버비 등 최소한의 비용만 분담하며, 구체적인 비용은 각 스터디 페이지에서 확인하실 수 있습니다.\n\n비용이 발생하는 경우 사전에 안내드리며, 참가자들이 합의한 금액입니다.",
    sources: [],
  },
  "초보자도 참여 가능한가요?": {
    message:
      "네! 초보자도 충분히 참여 가능합니다.\n\n다양한 난이도의 스터디가 준비되어 있어요:\n• 입문자용: 기초부터 차근차근 학습\n• 중급자용: 실무 프로젝트 경험\n• 고급자용: 심화 기술 학습\n\n각 스터디 설명에서 필요한 사전 지식을 확인하시고, 본인 수준에 맞는 스터디를 선택하세요.",
    sources: [],
  },
};

export const handleChat = async (
  message: string,
  search: SearchService,
  ai: Ai,
): Promise<ChatResponse | { error: string; status: number }> => {
  try {
    // 1단계: 질문이 커뮤니티 관련인지 판별
    const classification = await chatCompletion(
      ai,
      [{ role: 'user', content: PROMPTS.createQuestionClassifierPrompt(message) }],
      { temperature: 0.1, maxTokens: 10 },
    );

    if (!classification.trim().toUpperCase().includes('YES')) {
      return { message: PROMPTS.REJECTION_MESSAGE, sources: [] };
    }

    // 1.5단계: 미리 정의된 답변 확인
    const predefined = predefinedAnswers[message.trim()];
    if (predefined) {
      return predefined;
    }

    // 2단계: 관련 정보 검색
    const formattedResults = search.searchAll(message).map(({ item, score }) => ({
      title: 'title' in item ? item.title : item.question,
      content: 'title' in item ? item.description : item.answer,
      type: ('participants' in item ? 'project' : 'faq') as 'project' | 'faq',
      score,
    }));

    // 3단계: LLM을 통한 답변 생성
    const answer = await chatCompletion(
      ai,
      [
        { role: 'system', content: PROMPTS.SYSTEM_MESSAGE },
        { role: 'user', content: PROMPTS.createAnswerGenerationPrompt(message, formattedResults) },
      ],
      { temperature: 0.7, maxTokens: 1000 },
    );

    // 4단계: 응답 생성
    const sources = formattedResults.slice(0, 3).map(result => ({
      id: result.title.replace(/\s+/g, '-').toLowerCase(),
      title: result.title,
      content: result.content.substring(0, 200) + (result.content.length > 200 ? '...' : ''),
      score: result.score,
      type: result.type,
    }));

    return { message: answer, sources };
  } catch (error) {
    if (isLLMError(error)) {
      return { error: error.message, status: error.statusCode };
    }
    console.error('Chat error:', error);
    return { error: '채팅 처리 중 오류가 발생했습니다.', status: 500 };
  }
};
