// @ts-ignore - openai 모듈이 설치되어 있지만 타입스크립트가 인식하지 못함
import OpenAI from 'openai';

// Node.js 환경 타입 선언
declare const process: {
  env: {
    [key: string]: string | undefined;
    OPENAI_API_KEY?: string;
  };
};

declare const console: {
  error: (message?: any, ...optionalParams: any[]) => void;
  log: (message?: any, ...optionalParams: any[]) => void;
};

// OpenAI API 응답 타입 정의
export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LLMError {
  type: 'api_error' | 'rate_limit' | 'invalid_request' | 'timeout' | 'unknown';
  message: string;
  statusCode?: number;
}

// OpenAI 클라이언트 초기화
class LLMService {
  private openai: OpenAI;
  private readonly defaultModel = 'gpt-4o-mini'; // 비용 효율적인 모델 사용
  private readonly maxRetries = 3;
  private readonly timeout = 30000; // 30초 타임아웃

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
    });
  }

  /**
   * 기본 채팅 완성 함수
   */
  async chatCompletion(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    }
  ): Promise<LLMResponse> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: options?.model || this.defaultModel,
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1500,
        stream: options?.stream || false,
      });

      const content = completion.choices[0]?.message?.content || '';
      
      return {
        content,
        usage: completion.usage ? {
          prompt_tokens: completion.usage.prompt_tokens,
          completion_tokens: completion.usage.completion_tokens,
          total_tokens: completion.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      throw this.handleOpenAIError(error);
    }
  }

  /**
   * 단순 텍스트 완성 (프롬프트만 전달)
   */
  async simpleCompletion(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<LLMResponse> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'user', content: prompt }
    ];

    return this.chatCompletion(messages, options);
  }

  /**
   * 시스템 메시지와 사용자 메시지를 함께 전달
   */
  async completionWithSystem(
    systemMessage: string,
    userMessage: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<LLMResponse> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ];

    return this.chatCompletion(messages, options);
  }

  /**
   * OpenAI API 에러 핸들링
   */
  private handleOpenAIError(error: any): LLMError {
    console.error('OpenAI API Error:', error);

    // OpenAI SDK의 에러 타입별 처리
    if (error?.error?.type) {
      switch (error.error.type) {
        case 'invalid_request_error':
          return {
            type: 'invalid_request',
            message: '잘못된 요청입니다. 요청 형식을 확인해주세요.',
            statusCode: 400,
          };
        case 'rate_limit_exceeded':
          return {
            type: 'rate_limit',
            message: 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
            statusCode: 429,
          };
        case 'api_error':
          return {
            type: 'api_error',
            message: 'OpenAI API 서버 오류가 발생했습니다.',
            statusCode: 500,
          };
      }
    }

    // HTTP 상태 코드별 처리
    if (error?.status) {
      switch (error.status) {
        case 401:
          return {
            type: 'api_error',
            message: 'OpenAI API 키가 유효하지 않습니다.',
            statusCode: 401,
          };
        case 403:
          return {
            type: 'api_error',
            message: 'OpenAI API 접근 권한이 없습니다.',
            statusCode: 403,
          };
        case 429:
          return {
            type: 'rate_limit',
            message: 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
            statusCode: 429,
          };
        case 500:
        case 502:
        case 503:
          return {
            type: 'api_error',
            message: 'OpenAI API 서버 오류가 발생했습니다.',
            statusCode: error.status,
          };
      }
    }

    // 타임아웃 에러
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return {
        type: 'timeout',
        message: 'API 요청 시간이 초과되었습니다. 다시 시도해주세요.',
        statusCode: 408,
      };
    }

    // 기타 알 수 없는 에러
    return {
      type: 'unknown',
      message: '알 수 없는 오류가 발생했습니다.',
      statusCode: 500,
    };
  }

  /**
   * API 상태 체크 (헬스체크용)
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.simpleCompletion('Hello', {
        maxTokens: 10,
        temperature: 0,
      });
      return response.content.length > 0;
    } catch (error) {
      console.error('LLM Health check failed:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
let llmServiceInstance: LLMService | null = null;

export const llmService = {
  getInstance(): LLMService {
    if (!llmServiceInstance) {
      llmServiceInstance = new LLMService();
    }
    return llmServiceInstance;
  }
};

export default llmService;
