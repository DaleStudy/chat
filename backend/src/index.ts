import { z } from 'zod';
import { handleChat } from '@/chat';
import { SearchService, detectCategory } from '@/services/searchService';
import { studyData } from '@/utils/dataLoader';

const searchService = new SearchService(studyData.projects, studyData.faqs);

const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
});

const json = (body: unknown, status = 200) => Response.json(body, { status });

const search = (query: string | null) => {
  if (!query) {
    return json({ error: '검색어가 필요합니다.' }, 400);
  }

  const category = detectCategory(query);
  const results = searchService.searchByCategory(query, category);

  return json({
    query,
    category,
    results: results.map(result => ({
      id: result.item.id,
      title: 'title' in result.item ? result.item.title : result.item.question,
      content: 'description' in result.item ? result.item.description : result.item.answer,
      score: result.score,
      type: 'title' in result.item ? 'project' : 'faq',
    })),
  });
};

const chat = async (request: Request, env: Env) => {
  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return json({ error: '잘못된 요청 형식입니다.', details: parsed.error.errors }, 400);
  }

  const result = await handleChat(parsed.data.message, searchService, env.AI_GATEWAY_TOKEN);
  return 'error' in result ? json({ error: result.error }, result.status) : json(result);
};

export default {
  async fetch(request, env) {
    const { pathname, searchParams } = new URL(request.url);

    try {
      if (pathname === '/health' && request.method === 'GET') {
        return json({ status: 'OK', timestamp: new Date().toISOString(), service: 'dalestudy-chatbot' });
      }
      if (pathname === '/api/search' && request.method === 'GET') {
        return search(searchParams.get('q'));
      }
      if (pathname === '/api/chat' && request.method === 'POST') {
        return await chat(request, env);
      }
      return json({ error: '요청한 경로를 찾을 수 없습니다.' }, 404);
    } catch (error) {
      console.error('Unhandled error:', error);
      return json({ error: '서버 내부 오류가 발생했습니다.' }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
