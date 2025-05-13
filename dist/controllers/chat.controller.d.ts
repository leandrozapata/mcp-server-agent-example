import { AiService } from '../services/ai.service';
import { ChatRequest, ChatResponse } from '../interfaces/chat.interface';
export declare class ChatController {
    private readonly aiService;
    constructor(aiService: AiService);
    chat(chatRequest: ChatRequest): Promise<ChatResponse>;
}
