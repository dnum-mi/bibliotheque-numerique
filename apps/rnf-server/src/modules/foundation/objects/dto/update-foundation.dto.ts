import { PartialType } from '@nestjs/swagger'
import { CreateFoundationDto } from '@/modules/foundation/objects/dto/create-foundation.dto'

export class UpdateFoundationDto extends PartialType(CreateFoundationDto) {}
