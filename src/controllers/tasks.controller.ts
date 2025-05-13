import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { McpService } from '../services/mcp.service';
import { CreateTaskDto } from '../interfaces/task.interface';

@Controller('tasks')
export class TasksController {
  constructor(private readonly mcpService: McpService) {}

  @Get()
  async getTasks(@Query('status') status?: string) {
    return this.mcpService.getTasks(status);
  }

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.mcpService.createTask(createTaskDto);
  }

  @Patch(':id/complete')
  async completeTask(@Param('id') id: string) {
    return this.mcpService.completeTask(id);
  }
}
