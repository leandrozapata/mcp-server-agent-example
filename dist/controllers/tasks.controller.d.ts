import { McpService } from '../services/mcp.service';
import { CreateTaskDto } from '../interfaces/task.interface';
export declare class TasksController {
    private readonly mcpService;
    constructor(mcpService: McpService);
    getTasks(status?: string): Promise<import("../interfaces/task.interface").TasksResponse>;
    createTask(createTaskDto: CreateTaskDto): Promise<import("../interfaces/task.interface").Task>;
    completeTask(id: string): Promise<import("../interfaces/task.interface").Task>;
}
