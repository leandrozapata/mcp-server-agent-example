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

VERY IMPORTANT: When listing tasks, ALWAYS include the task ID in the format "ID: [task-id]" for each task.
When a user asks to complete a task by name or number, you MUST use the exact task ID when calling the complete-task function.
If a user refers to a task by number (e.g., "complete task 3") or by name (e.g., "complete the Meeting task"), you must find and use the corresponding task ID.

Never try to complete a task without having its exact ID. If you're unsure of a task ID, list all tasks first to get the IDs.
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
                    },
                    {
                        type: 'function',
                        function: {
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
                    },
                    {
                        type: 'function',
                        function: {
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
                    },
                ],
                tool_choice: 'auto',
            });
            const responseMessage = response.choices[0].message;
            if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                const toolCall = responseMessage.tool_calls[0];
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments);
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
            let result;
            switch (functionName) {
                case 'create-task':
                    await this.mcpService.createTask(args);
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Successfully created task "${args.title}".`,
                            },
                        ],
                    };
                case 'list-tasks':
                    result = await this.mcpService.getTasks(args.status);
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Here are the ${args.status || 'all'} tasks:\n${this.formatTaskList(result.tasks)}`,
                            },
                        ],
                    };
                case 'complete-task':
                    if (args.id) {
                        try {
                            await this.mcpService.completeTask(args.id);
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: `Successfully marked task as completed.`,
                                    },
                                ],
                            };
                        }
                        catch (error) {
                            const tasksResult = await this.mcpService.getTasks('all');
                            console.error(`Error completing task with ID ${args.id}:`, error);
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: `Error: Could not complete the task. Please verify the task ID.\n\nHere are the current tasks:\n${this.formatTaskList(tasksResult.tasks)}`,
                                    },
                                ],
                            };
                        }
                    }
                    else {
                        const tasksResult = await this.mcpService.getTasks('all');
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Error: Task ID is required to complete a task.\n\nHere are the current tasks:\n${this.formatTaskList(tasksResult.tasks)}`,
                                },
                            ],
                        };
                    }
                default:
                    result = await this.mcpService.executeMcpTool(functionName, args);
                    return result;
            }
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
    formatTaskList(tasks) {
        if (!tasks || tasks.length === 0) {
            return 'No tasks found.';
        }
        return tasks.map((task, index) => {
            const statusText = task.completed ? 'Completed' : 'Pending';
            return `${index + 1}. (ID: ${task.id}) - ${task.title}  [${statusText}]`;
        }).join('\n');
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mcp_service_1.McpService])
], AiService);
//# sourceMappingURL=ai.service.js.map