import { ConfigService } from '@nestjs/config';
import { McpService } from './mcp.service';
import { Message } from '../interfaces/chat.interface';
export declare class AiService {
    private readonly configService;
    private readonly mcpService;
    private readonly openai;
    private readonly systemPrompt;
    constructor(configService: ConfigService, mcpService: McpService);
    generateChatResponse(message: string, history: Message[]): Promise<string>;
    private executeMcpFunction;
    private formatTaskList;
}
