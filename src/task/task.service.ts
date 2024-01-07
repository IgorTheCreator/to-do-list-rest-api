import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateTaskDto, UpdateTaskDto } from './dto'
import { Task } from './types'

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async getTasks(userId: number): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
      },
    })
    return tasks
  }

  async createTask(userId: number, task: CreateTaskDto): Promise<Task> {
    const createdTask = await this.prisma.task.create({
      data: {
        description: task.description,
        complete: task.complete,
        userId,
      },
    })
    return createdTask
  }

  async deleteTask(userId: number, taskId: number) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    })
    if (!task) throw new ForbiddenException()
    await this.prisma.task.delete({
      where: {
        id: taskId,
      },
    })
  }

  async updateTask(
    userId: number,
    taskId: number,
    task: UpdateTaskDto,
  ): Promise<Task> {
    const checkedTask = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    })
    if (!checkedTask) throw new ForbiddenException()
    const updatedTask = await this.prisma.task.update({
      where: {
        id: taskId,
        userId,
      },
      data: {
        description: task.description,
        complete: task.complete,
      },
    })
    return updatedTask
  }
}
