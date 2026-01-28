import { ApiProperty } from '@nestjs/swagger'

export class SignUpOutputDto {
  @ApiProperty({
    description:
      'Indique que la demande a été prise en compte.',
    example: true,
  })
  success: boolean
}
