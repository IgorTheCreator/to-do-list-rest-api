import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

export class CreateTaskDto {
  @ApiProperty({ description: 'Task description', type: String })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({ description: 'Task status', type: Boolean })
  @IsBoolean()
  complete: boolean
}
