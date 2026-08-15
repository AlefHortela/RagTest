export interface ChatSource {
  occurrenceId: string;
  sourceType: string;
  excerpt: string;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  sources?: ChatSource[];
}
