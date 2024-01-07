import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class AuthDto {
  @ApiProperty({ description: 'User login', type: String })
  @IsString()
  @IsNotEmpty()
  login: string

  @ApiProperty({ description: 'User password', type: String })
  @IsString()
  @IsNotEmpty()
  password: string
}
