import { ApiProperty, PickType } from '@nestjs/swagger'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { IsOptional } from 'class-validator'
import type { Express } from 'express'

export class ImportMaarchDto extends PickType(Demarche, ['title'] as const) {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Le fichier CSV contenant les demandes.',
  })
  demandes: Express.Multer.File

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Le fichier CSV contenant les annotations.',
  })
  @IsOptional()
  annotations?: Express.Multer.File

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Le fichier CSV des accusés de réception.',
  })
  @IsOptional()
  accusesReception?: Express.Multer.File
}
