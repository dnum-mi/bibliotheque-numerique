import { ApiProperty } from '@nestjs/swagger'

export class InfoDSOutputDto {
  @ApiProperty({
    description: 'numero de démarche',
  })
    demarcheId: number | undefined

  @ApiProperty({
    description: 'numero de dossier',
  })
    dossierId: number | undefined
}
