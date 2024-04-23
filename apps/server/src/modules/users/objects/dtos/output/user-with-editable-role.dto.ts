import {
  IPrefectureOptions,
  OneDemarcheRoleOption,
  RolesKeys,
  PrefectureKeys,
  IUserWithEditableRole,
  Prefecture,
} from '@biblio-num/shared'
import { UserOutputDto } from './user-output.dto'
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { SmallDemarcheOutputDto } from '@/modules/demarches/objects/dtos/small-demarche-output.dto'

class PrefectureDto {
  @ApiProperty({
    description: 'Préfectures actuellement sélectionnées',
    type: String,
    enum: Prefecture,
    isArray: true,
  })
  value: PrefectureKeys[]

  @ApiProperty({
    description:
      "Préfectures possible à retirer en fonction des droits de l'utilisateur courant",
    type: String,
    enum: Prefecture,
    isArray: true,
  })
  deletable: PrefectureKeys[]

  @ApiProperty({
    description:
      "Préfectures possible à ajouter en fonction des droits de l'utilisateur courant",
    type: String,
    enum: Prefecture,
    isArray: true,
  })
  addable: PrefectureKeys[]
}

class NationalDto {
  @ApiProperty({
    description: 'Est ce que le rôle pour cette demarche est national',
    type: Boolean,
  })
  value: boolean

  @ApiProperty({
    description:
      "Est ce que l'utilisateur courant peut modifier l'option nationale",
    type: Boolean,
  })
  editable: boolean
}

class PrefectureOptionsDto implements IPrefectureOptions {
  @ApiProperty({
    description: 'option national',
    type: NationalDto,
  })
  national: {
    value: boolean
    editable: boolean
  }

  @ApiProperty({
    description: 'option prefectures',
    type: PrefectureDto,
  })
  prefectures: {
    value: PrefectureKeys[]
    deletable: PrefectureKeys[]
    addable: PrefectureKeys[]
  }
}

class OneDemarcheRoleOptionDto
  extends SmallDemarcheOutputDto
  implements OneDemarcheRoleOption {
  @ApiProperty({
    description: "Est ce que l'utilisateur possède un rôle sur cette démarche",
    type: Boolean,
  })
  checked: boolean

  @ApiProperty({
    description:
      "Est ce que l'utilisateur courant peut modifier modifier l'option sur cette démarche",
    type: Boolean,
  })
  editable: boolean

  @ApiProperty({
    description: 'Options locale ou nationale pour la démarche',
    type: PrefectureOptionsDto,
  })
  prefectureOptions: IPrefectureOptions
}

class DemarcheHashDtoExample {
  @ApiProperty({ type: OneDemarcheRoleOptionDto })
  1: OneDemarcheRoleOptionDto
}

@ApiExtraModels(OneDemarcheRoleOptionDto)
export class UserWithEditableRole implements IUserWithEditableRole {
  @ApiProperty({
    type: UserOutputDto,
  })
  originalUser: UserOutputDto

  @ApiProperty({
    type: Role,
    isArray: true,
  })
  possibleRoles: RolesKeys[]

  @ApiProperty({
    type: Boolean,
  })
  deletable: boolean

  @ApiProperty({
    description:
      "Record avec pour clef l'id de la démarche et pour type OneDemarcheRoleOptionDto.",
    type: () => DemarcheHashDtoExample,
  })
  demarcheHash: Record<number, OneDemarcheRoleOption>
}
