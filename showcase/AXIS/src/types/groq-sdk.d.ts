declare module 'groq-sdk' {
  interface GroqOptions {
    apiKey: string;
  }

  interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  interface ChatCompletionRequest {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
  }

  interface ChatCompletionChoice {
    message: {
      role: string;
      content: string | null;
    };
    index: number;
    finish_reason: string;
  }

  interface ChatCompletionResponse {
    choices: ChatCompletionChoice[];
  }

  interface ChatCompletions {
    create(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
  }

  class Groq {
    constructor(options: GroqOptions);
    chat: {
      completions: ChatCompletions;
    };
  }

  export = Groq;
}
