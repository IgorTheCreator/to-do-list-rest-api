import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { PrismaService } from 'src/prisma/prisma.service'
import { User } from './types'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(login: string, hash: string): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: {
          login,
          hash,
        },
      })
      return user
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new BadRequestException('User already exists')
        }
      }
      throw e
    }
  }

  async findUserByLogin(login: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        login,
      },
    })
    return user
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    })
    return user
  }

  async updateUserRtHash(userId: number, hashRt: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hashRt,
      },
    })
  }

  async deleteUserRtHash(userId: number) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    })
  }
}
