import { PartialType } from '@nestjs/swagger'
import { CreateCustomFilterDto } from './create-custom-filter.dto'

export class PatchCustomFilterDto extends PartialType(CreateCustomFilterDto) {}
