import { ApiProperty } from '@nestjs/swagger'
import { InfoDSOutputDto } from '../info-ds-output.dto'

export class RnfIdOutputDto {
  ds: InfoDSOutputDto
  @ApiProperty()
    rnfId: string
}
