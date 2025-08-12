import { Router } from 'express';
import { z } from 'zod';
import { ChatRequest, ChatResponse } from '@/types';
import llmService, { LLMError } from '@/services/llmService';
import { PROMPTS } from '@/utils/prompts';
import { SearchService } from '@/services/searchService';
import { loadStudyData } from '@/utils/dataLoader';

// Node.js 환경 타입 선언
declare const console: {
  error: (message?: any, ...optionalParams: any[]) => void;
  log: (message?: any, ...optionalParams: any[]) => void;
};

const router = Router();

// 요청 스키마 검증
const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000)
});

// 스터디 데이터 및 검색 서비스 초기화
let searchService: SearchService | null = null;

const initializeSearchService = async () => {
  if (!searchService) {
    try {
      const studyData = await loadStudyData();
      searchService = new SearchService(studyData.projects, studyData.faqs);
    } catch (error) {
      console.error('Failed to initialize search service:', error);
    }
  }
  return searchService;
};

// 채팅 엔드포인트 (LLM 연동 완료)
router.post('/chat', async (req, res) => {
  try {
    const validatedData = chatRequestSchema.parse(req.body);
    const { message } = validatedData;

    // 검색 서비스 초기화
    const search = await initializeSearchService();
    if (!search) {
      return res.status(500).json({ 
        error: '검색 서비스 초기화에 실패했습니다.' 
      });
    }

    // 1단계: 질문이 커뮤니티 관련인지 판별
    const classifierPrompt = PROMPTS.createQuestionClassifierPrompt(message);
    const classificationResponse = await llmService.getInstance().simpleCompletion(classifierPrompt, {
      temperature: 0.1, // 일관된 분류를 위해 낮은 temperature
      maxTokens: 10
    });

    const isRelevant = classificationResponse.content.trim().toUpperCase().includes('YES');

    if (!isRelevant) {
      // 관련 없는 질문에 대한 정중한 거절
      const response: ChatResponse = {
        message: PROMPTS.REJECTION_MESSAGE,
        sources: []
      };
      return res.json(response);
    }

    // 2단계: 관련 정보 검색
    const searchResults = search.searchAll(message);
    
    // 검색 결과를 답변 생성용 형태로 변환
    const formattedResults = searchResults.map(result => {
      const item = result.item;
      let title: string;
      let content: string;
      
      // StudyProject인지 FAQ인지 확인하여 적절한 필드 사용
      if ('title' in item && item.title) {
        // StudyProject
        title = item.title;
        content = item.description || '';
      } else if ('question' in item) {
        // FAQ
        title = item.question;
        content = item.answer;
      } else {
        title = 'Unknown';
        content = '';
      }
      
      const itemType: 'project' | 'faq' = 'participants' in item ? 'project' : 'faq';
      
      return {
        title,
        content,
        type: itemType,
        score: result.score
      };
    });

    // 3단계: LLM을 통한 답변 생성
    const answerPrompt = PROMPTS.createAnswerGenerationPrompt(message, formattedResults);
    const answerResponse = await llmService.getInstance().completionWithSystem(
      PROMPTS.SYSTEM_MESSAGE,
      answerPrompt,
      {
        temperature: 0.7,
        maxTokens: 1000
      }
    );

    // 4단계: 응답 생성
    const sources = formattedResults.slice(0, 3).map(result => ({
      id: (result.title || '').replace(/\s+/g, '-').toLowerCase(),
      title: result.title,
      content: result.content.substring(0, 200) + (result.content.length > 200 ? '...' : ''),
      score: result.score,
      type: result.type
    }));

    const response: ChatResponse = {
      message: answerResponse.content,
      sources
    };

    res.json(response);
  } catch (error) {
    // LLM 에러 처리
    if (error && typeof error === 'object' && 'type' in error) {
      const llmError = error as LLMError;
      return res.status(llmError.statusCode || 500).json({
        error: llmError.message
      });
    }

    // TypeScript 에러 처리
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: '잘못된 요청 형식입니다.',
        details: error.errors 
      });
    }

    console.error('Chat error:', error);
    res.status(500).json({ error: '채팅 처리 중 오류가 발생했습니다.' });
  }
});

export default router;
