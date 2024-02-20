import { OmitType, PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'
import { IUpdateProfile } from '@biblio-num/shared'

export class UpdateProfileDto extends PartialType(OmitType(CreateUserDto, ['email', 'password']))
  implements IUpdateProfile {}
