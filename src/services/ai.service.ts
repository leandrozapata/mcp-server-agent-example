import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { McpService } from './mcp.service';
import { Message } from '../interfaces/chat.interface';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  private readonly systemPrompt = `You are a helpful AI assistant that helps users manage their tasks. 
You can create tasks, list tasks, and mark tasks as completed.
When users ask about tasks or mention something that sounds like a task, offer to help them manage it.

VERY IMPORTANT: When listing tasks, ALWAYS include the task ID in the format "ID: [task-id]" for each task.
When a user asks to complete a task by name or number, you MUST use the exact task ID when calling the complete-task function.
If a user refers to a task by number (e.g., "complete task 3") or by name (e.g., "complete the Meeting task"), you must find and use the corresponding task ID.

Never try to complete a task without having its exact ID. If you're unsure of a task ID, list all tasks first to get the IDs.
Be concise and helpful in your responses.`;

  constructor(
    private readonly configService: ConfigService,
    private readonly mcpService: McpService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateChatResponse(message: string, history: Message[]): Promise<string> {
    try {
      // Convert history to OpenAI format
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...history.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: messages as any[],
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

      // Check if the model wants to use a tool
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        const toolCall = responseMessage.tool_calls[0];
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        // Execute the MCP tool
        const functionResult = await this.executeMcpFunction(functionName, functionArgs);
        
        // Call OpenAI again with the function result
        const finalResponse = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: [
            { role: 'system', content: this.systemPrompt },
            ...history,
            { role: 'user', content: message },
            responseMessage as any,
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
    } catch (error) {
      console.error('Error generating chat response:', error);
      return 'Sorry, I encountered an error while processing your request.';
    }
  }

  private async executeMcpFunction(functionName: string, args: any): Promise<any> {
    try {
      let result;
      
      // Call the appropriate MCP service method directly based on the function name
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
          // If we have a task ID, use it directly
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
            } catch (error) {
              // Get all tasks to provide better context in the error message
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
          } else {
            // If we don't have an ID, return an error with the task list
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
          // Fall back to the generic executeMcpTool method
          result = await this.mcpService.executeMcpTool(functionName, args);
          return result;
      }
    } catch (error) {
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
  
  private formatTaskList(tasks: any[]): string {
    if (!tasks || tasks.length === 0) {
      return 'No tasks found.';
    }
    
    return tasks.map((task, index) => {
      const statusText = task.completed ? 'Completed' : 'Pending';
      return `${index + 1}. (ID: ${task.id}) - ${task.title}  [${statusText}]`;
    }).join('\n');
  }

  // No need for getFunctionDefinitions() as we're defining tools directly in the OpenAI call
}
