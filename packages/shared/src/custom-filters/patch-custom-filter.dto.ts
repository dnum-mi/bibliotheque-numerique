import { PartialType } from '@nestjs/mapped-types'
import { CreateCustomFilterDto } from './create-custom-filter.dto'

export class PatchCustomFilterDto extends PartialType(CreateCustomFilterDto) {}
