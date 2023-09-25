import { IsDefined, IsString } from 'class-validator'
import { isRnfIdValid } from '@/shared/validators/rnf-id/rnf-id.decorator'

export class GetFoundationInputDto {
  @IsDefined()
  @IsString()
  @isRnfIdValid()
  rnfId: string
}
