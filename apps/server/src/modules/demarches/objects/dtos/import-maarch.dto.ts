import { PickType } from '@nestjs/swagger'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'

export class ImportMaarchDto extends PickType(Demarche, ['title'] as const) {}
