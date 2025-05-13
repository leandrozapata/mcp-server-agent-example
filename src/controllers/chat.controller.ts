import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from '../services/ai.service';
import { ChatRequest, ChatResponse } from '../interfaces/chat.interface';

@Controller('chat')
export class ChatController {
  constructor(private readonly aiService: AiService) {}

  @Post()
  async chat(@Body() chatRequest: ChatRequest): Promise<ChatResponse> {
    const response = await this.aiService.generateChatResponse(
      chatRequest.message,
      chatRequest.history,
    );
    
    return { response };
  }
}
