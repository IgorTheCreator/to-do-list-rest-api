import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { AuthDto } from './dto'
import * as argon from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UserService } from 'src/user/user.service'
import { Tokens } from './types'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(dto: AuthDto): Promise<Tokens> {
    const hash = await this.hashData(dto.password)
    const user = await this.userService.createUser(dto.login, hash)

    const tokens = await this.getTokens(user.id, user.login)
    await this.updateRtHash(user.id, tokens.refresh_token)
    return tokens
  }

  async signin(dto: AuthDto): Promise<Tokens> {
    const user = await this.userService.findUserByLogin(dto.login)
    if (!user) throw new BadRequestException('User does not exists')
    const passwordMatches = await argon.verify(user.hash, dto.password)
    if (!passwordMatches) throw new BadRequestException('Password is incorrect')

    const tokens = await this.getTokens(user.id, user.login)
    await this.updateRtHash(user.id, tokens.refresh_token)
    return tokens
  }

  async logout(userId: number) {
    await this.userService.deleteUserRtHash(userId)
  }

  async refresh(userId: number, refreshToken: string): Promise<Tokens> {
    const user = await this.userService.findUserById(userId)
    if (!user || !user.hashedRt) throw new ForbiddenException('Access denied')

    const rtMatches = await argon.verify(user.hashedRt, refreshToken)
    if (!rtMatches) throw new ForbiddenException('Access denied')

    const tokens = await this.getTokens(user.id, user.login)
    await this.updateRtHash(user.id, tokens.refresh_token)
    return tokens
  }

  async hashData(data: string) {
    return argon.hash(data)
  }

  async getTokens(userId: number, login: string): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(
        {
          sub: userId,
          login,
        },
        {
          secret: this.config.get('SECRET_KEY'),
          expiresIn: '15m',
        },
      ),
      this.jwt.signAsync(
        {
          sub: userId,
          login,
        },
        {
          secret: this.config.get('REFRESH_SECRET_KEY'),
          expiresIn: '7d',
        },
      ),
    ])
    return { access_token, refresh_token }
  }

  async updateRtHash(userId: number, refreshToken: string) {
    const hash = await this.hashData(refreshToken)
    await this.userService.updateUserRtHash(userId, hash)
  }
}
