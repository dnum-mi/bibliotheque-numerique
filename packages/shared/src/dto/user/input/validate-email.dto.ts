import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class ValidateEmailDto {
  @ApiProperty({
    description: 'toujours vrai',
  })
  validate: boolean

  @ApiProperty({
    description: "Token pour la validation d'adresse courriel",
    example: 'jeytsrniatseirnateisalp7890tsrntesrn.890890D.90V98TESRI0V89IEJ',
  })
  @IsNotEmpty({
    message:
      "Veuillez fournir le token pour la validation d'adresse courriel",
  })
  token: string
}
