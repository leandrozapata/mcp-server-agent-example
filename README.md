# 🔎 OpenAI Agent Server - MCP Bridge

![OpenAI API](https://img.shields.io/badge/OpenAI%20API-Ready-brightgreen)
![NestJS](https://img.shields.io/badge/NestJS-10.0%2B-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)

A powerful NestJS backend that bridges OpenAI's Agent framework with MCP (Model Context Protocol) servers, enabling AI assistants to execute real-world actions through natural language requests.

## 🌟 Key Features

- **AI-Powered Chat Interface**: Seamless integration with OpenAI's latest models
- **Function Calling**: Intelligent mapping of natural language to executable functions
- **MCP Tool Execution**: Bridge between AI models and MCP-compatible tools
- **Task Management API**: Complete CRUD operations for task management
- **Stateless Architecture**: Designed for scalability and reliability
- **Developer-Friendly**: Comprehensive documentation and type safety

## 🛠️ Tech Stack

- **NestJS** framework for robust backend architecture
- **TypeScript** for type-safe development
- **OpenAI API** with advanced function calling capabilities
- **Axios** for efficient HTTP requests
- **MCP Protocol** compatibility for tool execution

## 🔗 How It Works

This server acts as an intelligent bridge between your frontend application and MCP-compatible tools:

1. **User Request**: The frontend sends a natural language request
2. **AI Processing**: OpenAI models interpret the request and identify required actions
3. **Function Mapping**: The server maps AI intentions to appropriate MCP tools
4. **Tool Execution**: MCP tools are executed with the necessary parameters
5. **Response Generation**: Results are processed and returned to the user

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- MCP server running (see the `mcp-server` project)
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/mcp-agent-server-example.git
cd agent-server-example
```

2. Install dependencies:

```bash
npm install
```

3. Configure the environment:

Create a `.env` file based on the provided `.env.example`:

```
PORT=4000
OPENAI_API_KEY=your_openai_api_key
MCP_SERVER_URL=http://localhost:3001
```

4. Start the development server:

```bash
npm run start:dev
```

The server will be available at http://localhost:4000.

## 💻 API Endpoints

### Chat API

```
POST /chat
```

Enables natural language interaction with the AI assistant.

Request body:
```json
{
  "message": "Create a task to finish the report by Friday",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there! How can I help you today?" }
  ]
}
```

### Task Management API

```
GET /tasks?status=[all|pending|completed]  # List tasks with optional filtering
POST /tasks                                # Create a new task
PATCH /tasks/:id/complete                 # Mark a task as completed
```

## 📂 Project Structure

- `src/controllers/` - API endpoints and request handling
- `src/services/` - Business logic and integration with OpenAI and MCP
- `src/interfaces/` - TypeScript type definitions
- `src/config/` - Application configuration

## 🔧 Building for Production

To build the application for production:

```bash
npm run build
```

The compiled files will be in the `dist` directory.

## 🔄 Integration with Frontend

This server pairs perfectly with the `mcp-agent-client-example` project, which provides a web interface for interacting with this backend.

## 📋 Future Enhancements

- Authentication and user management
- Support for multiple MCP servers
- Streaming responses for real-time interactions
- Advanced context management for improved AI understanding
- Performance metrics and monitoring

## 📄 License

MIT

---

*Bridging the gap between natural language and executable actions* 🤖⚒️
