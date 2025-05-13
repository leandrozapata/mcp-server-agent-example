export interface Message {
    role: 'user' | 'assistant' | 'system' | 'function';
    content: string;
    name?: string;
}
export interface ChatRequest {
    message: string;
    history: Message[];
}
export interface ChatResponse {
    response: string;
}
