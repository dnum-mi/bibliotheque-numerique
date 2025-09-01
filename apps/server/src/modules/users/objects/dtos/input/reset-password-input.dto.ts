import { PickType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'
import { IResetPasswordInput } from '@biblio-num/shared'

export class ResetPasswordInputDto extends PickType(CreateUserDto, ['email']) implements IResetPasswordInput {}
