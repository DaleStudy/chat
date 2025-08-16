export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sources?: SearchResult[];
}

export interface ChatResponse {
  message: string;
  sources?: SearchResult[];
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
  type: 'project' | 'faq';
}
