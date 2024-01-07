import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common'
import { GetCurrentUser } from 'src/common/decorators'
import { TaskService } from './task.service'
import { CreateTaskDto, UpdateTaskDto } from './dto'
import { Task } from './types'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

@ApiBearerAuth()
@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiCreatedResponse({ description: 'Created', type: CreateTaskDto })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Credentials wrong' })
  postTask(
    @GetCurrentUser('sub') userId: number,
    @Body() task: CreateTaskDto,
  ): Promise<Task> {
    return this.taskService.createTask(userId, task)
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiOkResponse({ description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  getTasks(@GetCurrentUser('sub') userId: number): Promise<Task[]> {
    return this.taskService.getTasks(userId)
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update task' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiOkResponse({ description: 'Updated', type: UpdateTaskDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiForbiddenResponse({ description: 'Credentials wrong' })
  updateTask(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) taskId: number,
    @Body() task: UpdateTaskDto,
  ): Promise<Task> {
    return this.taskService.updateTask(userId, taskId, task)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'id', required: true, description: 'Task identifier' })
  @ApiOkResponse({ description: 'Deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiForbiddenResponse({ description: 'Credentials wrong' })
  deleteTask(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.deleteTask(userId, taskId)
  }
}
