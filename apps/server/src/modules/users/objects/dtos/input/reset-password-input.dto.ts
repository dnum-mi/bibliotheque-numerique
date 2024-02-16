import { PickType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'

export class ResetPasswordInputDto extends PickType(CreateUserDto, ['email']) {}
