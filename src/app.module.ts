import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TasksController } from './controllers/tasks.controller';
import { ChatController } from './controllers/chat.controller';
import { McpService } from './services/mcp.service';
import { AiService } from './services/ai.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [TasksController, ChatController],
  providers: [McpService, AiService],
})
export class AppModule {}
