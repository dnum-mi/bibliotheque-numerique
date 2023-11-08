import { OmitType } from '@nestjs/swagger'
import { PaginationDto } from '../pagination'
import { UserOutputDto } from './user-output.dto'

class PaginableUser extends OmitType(UserOutputDto, ['role']) {
}

export class PaginationUserDto extends PaginationDto<PaginableUser> {}
