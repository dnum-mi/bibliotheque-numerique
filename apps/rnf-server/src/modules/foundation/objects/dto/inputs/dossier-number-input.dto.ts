import { IsBoolean, IsDefined, IsEmail, IsNumber, IsOptional, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class DossierNumberInputDto {
  @IsDefined()
  @IsNumber()
  @Min(0)
  @ApiProperty({
    description: 'Numéro du dossier de DS à partir duquel créer la fondation.',
  })
    dossierId: number

  @IsDefined()
  @IsEmail()
  @ApiProperty({
    description: "Email d'un des instructeurs du dossier DS.",
  })
    email: string

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: "Passer la vérification des fondations similaires, et forcer la création d'une fondation.",
  })
    forceCreate?: boolean
}
