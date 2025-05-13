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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const mcp_service_1 = require("../services/mcp.service");
let TasksController = class TasksController {
    constructor(mcpService) {
        this.mcpService = mcpService;
    }
    async getTasks(status) {
        return this.mcpService.getTasks(status);
    }
    async createTask(createTaskDto) {
        return this.mcpService.createTask(createTaskDto);
    }
    async completeTask(id) {
        return this.mcpService.completeTask(id);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getTasks", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "createTask", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "completeTask", null);
exports.TasksController = TasksController = __decorate([
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [mcp_service_1.McpService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map