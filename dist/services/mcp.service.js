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
exports.McpService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const config_1 = require("@nestjs/config");
let McpService = class McpService {
    constructor(configService) {
        this.configService = configService;
        this.mcpServerUrl = this.configService.get('MCP_SERVER_URL');
    }
    async getTasks(status) {
        try {
            const params = status ? { status } : {};
            const response = await axios_1.default.get(`${this.mcpServerUrl}/api/tasks`, { params });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async createTask(createTaskDto) {
        try {
            if (!createTaskDto.title) {
                throw new Error('Task title is required');
            }
            const response = await axios_1.default.post(`${this.mcpServerUrl}/api/tasks`, createTaskDto);
            if (!response?.data) {
                throw new Error('Failed to create task: No response from server');
            }
            return response.data;
        }
        catch (error) {
            const errorMessage = error.response?.data?.message ?? error.message ?? 'Unknown error';
            this.handleError(error);
            throw new Error(`Failed to create task: ${errorMessage}`);
        }
    }
    async completeTask(id) {
        try {
            const response = await axios_1.default.patch(`${this.mcpServerUrl}/api/tasks/${id}/complete`);
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async executeMcpTool(tool, params) {
        try {
            const response = await axios_1.default.post(`${this.mcpServerUrl}/api/mcp/execute`, {
                tool,
                params,
            });
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    handleError(error) {
        if (axios_1.default.isAxiosError(error)) {
            const status = error.response?.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data?.message ?? error.message ?? 'An error occurred with the MCP server';
            throw new common_1.HttpException(message, status);
        }
        throw new common_1.HttpException('An unexpected error occurred', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
};
exports.McpService = McpService;
exports.McpService = McpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], McpService);
//# sourceMappingURL=mcp.service.js.map