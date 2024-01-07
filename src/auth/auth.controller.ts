import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common'
import { AuthDto } from './dto'
import { AuthService } from './auth.service'
import { Tokens } from './types'
import { RefreshTokenGuard } from 'src/common/guards'
import { GetCurrentUser, Public } from 'src/common/decorators'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Signup user' })
  @ApiBody({ type: AuthDto })
  @ApiOkResponse({ description: 'Success' })
  @ApiBadRequestResponse()
  signup(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signup(dto)
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Signin user' })
  @ApiBody({ type: AuthDto })
  @ApiOkResponse({ description: 'Success' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  signin(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signin(dto)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiOkResponse({ description: 'Success' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  logout(@GetCurrentUser('sub') userId: number) {
    this.authService.logout(userId)
  }

  @Public()
  @ApiBearerAuth()
  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get refresh token user' })
  @ApiOkResponse({ description: 'Success' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  refresh(
    @GetCurrentUser('sub') userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refresh(userId, refreshToken)
  }
}
