import { IsNotEmpty } from 'class-validator'
import { Demarche as DemarcheDS } from '@dnum-mi/ds-api-client/dist/@types/types'

export class CreateDemarcheDSDto {
  @IsNotEmpty()
    dataJson: Partial<DemarcheDS>
}
