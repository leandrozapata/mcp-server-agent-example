"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = require("openai");
const mcp_service_1 = require("./mcp.service");
let AiService = class AiService {
    constructor(configService, mcpService) {
        this.configService = configService;
        this.mcpService = mcpService;
        this.systemPrompt = `You are a helpful AI assistant that helps users manage their tasks. 
You can create tasks, list tasks, and mark tasks as completed.
When users ask about tasks or mention something that sounds like a task, offer to help them manage it.
Be concise and helpful in your responses.`;
        this.openai = new openai_1.default({
            apiKey: this.configService.get('OPENAI_API_KEY'),
        });
    }
    async generateChatResponse(message, history) {
        try {
            const messages = [
                { role: 'system', content: this.systemPrompt },
                ...history.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
                { role: 'user', content: message },
            ];
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo',
                messages: messages,
                tools: [
                    {
                        type: 'function',
                        function: {
                            name: 'execute_tool',
                            description: 'Execute a task management tool',
                            parameters: {
                                type: 'object',
                                properties: {
                                    tool_name: {
                                        type: 'string',
                                        enum: ['create-task', 'list-tasks', 'complete-task'],
                                        description: 'The name of the tool to execute',
                                    },
                                    tool_args: {
                                        type: 'object',
                                        description: 'The arguments for the tool',
                                    },
                                },
                                required: ['tool_name', 'tool_args'],
                            },
                        },
                    },
                ],
                tool_choice: 'auto',
            });
            const responseMessage = response.choices[0].message;
            if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                const toolCall = responseMessage.tool_calls[0];
                const toolArgs = JSON.parse(toolCall.function.arguments);
                const functionName = toolArgs.tool_name;
                const functionArgs = toolArgs.tool_args;
                const functionResult = await this.executeMcpFunction(functionName, functionArgs);
                const finalResponse = await this.openai.chat.completions.create({
                    model: 'gpt-4-turbo',
                    messages: [
                        { role: 'system', content: this.systemPrompt },
                        ...history,
                        { role: 'user', content: message },
                        responseMessage,
                        {
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify(functionResult),
                        },
                    ],
                });
                return finalResponse.choices[0].message.content || 'I processed your request but have no additional information to provide.';
            }
            return responseMessage.content || 'I\'m not sure how to respond to that.';
        }
        catch (error) {
            console.error('Error generating chat response:', error);
            return 'Sorry, I encountered an error while processing your request.';
        }
    }
    async executeMcpFunction(functionName, args) {
        try {
            const result = await this.mcpService.executeMcpTool(functionName, args);
            return result;
        }
        catch (error) {
            console.error(`Error executing MCP function ${functionName}:`, error);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error executing ${functionName}: ${error.message ?? 'Unknown error'}`,
                    },
                ],
            };
        }
    }
    getFunctionDefinitions() {
        return [
            {
                name: 'create-task',
                description: 'Create a new task with title and description',
                parameters: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'Title of the task',
                        },
                        description: {
                            type: 'string',
                            description: 'Description of the task',
                        },
                    },
                    required: ['title'],
                },
            },
            {
                name: 'list-tasks',
                description: 'Get a list of all tasks',
                parameters: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['all', 'pending', 'completed'],
                            description: 'Filter tasks by status: all, pending, or completed',
                        },
                    },
                },
            },
            {
                name: 'complete-task',
                description: 'Mark a task as completed',
                parameters: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'ID of the task to mark as completed',
                        },
                    },
                    required: ['id'],
                },
            },
        ];
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mcp_service_1.McpService])
], AiService);
//# sourceMappingURL=ai.service.new.js.map