import { ITotal } from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'

export class TotalDto implements ITotal {
  @ApiProperty({
    description: 'Nom du total',
    type: String,
  })
  label: string

  @ApiProperty({
    description: 'total',
    type: Number,
  })
  total: number
}
