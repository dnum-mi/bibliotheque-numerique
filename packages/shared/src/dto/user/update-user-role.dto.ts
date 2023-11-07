import { ApiProperty } from '@nestjs/swagger'
import { OrganismeTypeKeys, PrefectureKeys } from '../../enums'
import { UserOutputDto } from './user-output.dto'
import { isNotEmpty } from 'class-validator'

export type prefectureOptions = {
  national: {
    value: boolean
    editable: boolean
  },
  prefectures: {
    value: PrefectureKeys[],
    deletable: PrefectureKeys[],
    addable: PrefectureKeys[]
  }
}

export type demarcheOptions = {
  id: number,
  checked: boolean,
  label: string,
  types: OrganismeTypeKeys[],
  prefectureOptions: prefectureOptions
}

// User With Role Update Possibility Output Dto (trouver un meilleur nom, mais celui là est trop long)
export class UwrupoDto {
  @ApiProperty({
    description: "Information de l'utilisateur sélectionné",
  })
  user: UserOutputDto

  @ApiProperty({
    description: 'List des démarches',
  })
  demarcheHash: Record<number, demarcheOptions>
}
