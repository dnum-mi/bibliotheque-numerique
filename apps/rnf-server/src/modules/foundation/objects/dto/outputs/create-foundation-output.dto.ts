import { CreateFoundationDto } from '../create-foundation.dto'
import { InfoDSOutputDto } from '../info-ds-output.dto'

export class CreateFoundationOutputDto {
  foundation: CreateFoundationDto
  ds: InfoDSOutputDto
}
