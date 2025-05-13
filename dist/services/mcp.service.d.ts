import { ConfigService } from '@nestjs/config';
import { Task, CreateTaskDto, TasksResponse, McpResponse } from '../interfaces/task.interface';
export declare class McpService {
    private readonly configService;
    private readonly mcpServerUrl;
    constructor(configService: ConfigService);
    getTasks(status?: string): Promise<TasksResponse>;
    createTask(createTaskDto: CreateTaskDto): Promise<Task>;
    completeTask(id: string): Promise<Task>;
    executeMcpTool(tool: string, params: any): Promise<McpResponse>;
    private handleError;
}
