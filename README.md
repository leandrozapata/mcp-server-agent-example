# MCP AI Assistant - Backend

A NestJS backend that integrates with OpenAI and your MCP server to provide an AI assistant for task management.

## Features

- Chat API with OpenAI integration
- Task management API that connects to your MCP server
- Function calling to execute MCP tools based on natural language requests

## Tech Stack

- NestJS framework
- TypeScript
- OpenAI API with function calling
- Vercel AI SDK for AI integration
- Axios for HTTP requests

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- MCP server running (your task manager server)
- OpenAI API key

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure the environment:

Create or modify the `.env` file in the root directory:

```
PORT=4000
OPENAI_API_KEY=your_openai_api_key
MCP_SERVER_URL=http://localhost:3000
```

3. Start the development server:

```bash
npm run start:dev
```

The server will be available at http://localhost:4000.

## API Endpoints

### Chat

- `POST /chat` - Send a message to the AI assistant

Request body:
```json
{
  "message": "Create a task to finish the report",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there! How can I help you today?" }
  ]
}
```

### Tasks

- `GET /tasks` - Get all tasks (optional query param: status=all|pending|completed)
- `POST /tasks` - Create a new task
- `PATCH /tasks/:id/complete` - Mark a task as completed

## Project Structure

- `src/controllers/` - API controllers
- `src/services/` - Business logic services
- `src/interfaces/` - TypeScript interfaces
- `src/config/` - Configuration files

## Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

MIT
