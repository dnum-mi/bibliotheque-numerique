import { ePasswordRequestsDecision, PasswordRequestsDecisionKey } from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty } from 'class-validator'

export class ManagePasswordRequestDto {
  @ApiProperty({ enum: ePasswordRequestsDecision, example: 'approve' })
  @IsEnum(ePasswordRequestsDecision)
  @IsNotEmpty()
  action: PasswordRequestsDecisionKey
}
