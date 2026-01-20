import { PartialType } from '@nestjs/swagger'
import { CreateViewDto } from './create-view.dto'

export class PatchViewDto extends PartialType(CreateViewDto) {}
