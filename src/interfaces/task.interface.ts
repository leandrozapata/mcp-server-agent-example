export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
}

export interface TasksResponse {
  tasks: Task[];
}

export interface McpResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}
