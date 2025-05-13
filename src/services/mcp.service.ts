import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Task, CreateTaskDto, TasksResponse, McpResponse } from '../interfaces/task.interface';

@Injectable()
export class McpService {
  private readonly mcpServerUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.mcpServerUrl = this.configService.get<string>('MCP_SERVER_URL');
  }

  async getTasks(status?: string): Promise<TasksResponse> {
    try {
      const params = status ? { status } : {};
      const response = await axios.get<TasksResponse>(`${this.mcpServerUrl}/api/tasks`, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      // Only validate that title exists
      if (!createTaskDto.title) {
        throw new Error('Task title is required');
      }
      
      // Pass the task data to the MCP server
      const response = await axios.post<Task>(`${this.mcpServerUrl}/api/tasks`, createTaskDto);
      
      if (!response?.data) {
        throw new Error('Failed to create task: No response from server');
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message ?? error.message ?? 'Unknown error';
      this.handleError(error);
      throw new Error(`Failed to create task: ${errorMessage}`);
    }
  }

  async completeTask(id: string): Promise<Task> {
    try {
      const response = await axios.patch<Task>(`${this.mcpServerUrl}/api/tasks/${id}/complete`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async executeMcpTool(tool: string, params: any): Promise<McpResponse> {
    try {
      const response = await axios.post<McpResponse>(`${this.mcpServerUrl}/api/mcp/execute`, {
        tool,
        params,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response?.data?.message ?? error.message ?? 'An error occurred with the MCP server';
      throw new HttpException(message, status);
    }
    throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
