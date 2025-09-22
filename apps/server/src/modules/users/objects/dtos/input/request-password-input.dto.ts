import { PickType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'
import { IRequestManualResetPassword } from '@biblio-num/shared'

export class RequestPasswordInputDto
  extends PickType(CreateUserDto, ['email', 'password'])
  implements IRequestManualResetPassword {}
