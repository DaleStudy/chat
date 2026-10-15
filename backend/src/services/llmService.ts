// AI Gateway 를 거치는 OpenAI 엔드포인트. OpenAI 키는 게이트웨이에 저장돼 있다.
const AI_GATEWAY_ACCOUNT_ID = '86aa227176a624680f7d34e691472576';
const AI_GATEWAY_ID = 'dalestudy';
const CHAT_COMPLETIONS_URL = `https://gateway.ai.cloudflare.com/v1/${AI_GATEWAY_ACCOUNT_ID}/${AI_GATEWAY_ID}/openai/chat/completions`;
const MODEL = 'gpt-6-luna';

export interface LLMError {
  message: string;
  statusCode: number;
}

type Message = { role: 'system' | 'user'; content: string };

const toLLMError = (status: number): LLMError => {
  switch (status) {
    case 400:
      return { statusCode: 400, message: '잘못된 요청입니다. 요청 형식을 확인해주세요.' };
    case 401:
    case 403:
      return { statusCode: status, message: 'AI Gateway 인증에 실패했습니다.' };
    case 429:
      return { statusCode: 429, message: 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' };
    default:
      return { statusCode: 500, message: 'OpenAI API 서버 오류가 발생했습니다.' };
  }
};

export const isLLMError = (error: unknown): error is LLMError =>
  typeof error === 'object' && error !== null && 'statusCode' in error;

export const chatCompletion = async (
  gatewayToken: string,
  messages: Message[],
  options: { temperature: number; maxTokens: number },
): Promise<string> => {
  const response = await fetch(CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      'cf-aig-authorization': `Bearer ${gatewayToken}`,
      'cf-aig-max-attempts': '3',
      'cf-aig-retry-delay': '1000',
      'cf-aig-backoff': 'exponential',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      reasoning_effort: 'none',
      temperature: options.temperature,
      max_completion_tokens: options.maxTokens,
    }),
  });

  if (!response.ok) {
    console.error('OpenAI API Error:', response.status, await response.text());
    throw toLLMError(response.status);
  }

  const completion = await response.json<{ choices: { message?: { content?: string } }[] }>();
  return completion.choices[0]?.message?.content ?? '';
};
