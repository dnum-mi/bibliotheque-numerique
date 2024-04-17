import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { UserService } from '../providers/user.service'

import { IUser, Roles } from '@biblio-num/shared'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { PublicRoute } from '@/modules/users/providers/decorators/public-route.decorator'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CurrentUser } from '@/modules/users/providers/decorators/current-user.decorator'
import {
  CreateUserDto,
  PaginationUserDto,
} from '@/modules/users/objects/dtos/input'
import {
  PaginatedUserDto,
  UserOutputDto,
} from '@/modules/users/objects/dtos/output'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly usersService: UserService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Post()
  @UsualApiOperation({
    summary: 'Créer un utilisateur.',
    method: 'POST',
    minimumRole: 'aucun',
    responseType: UserOutputDto,
  })
  @PublicRoute()
  async signUp(@Body() body: CreateUserDto): Promise<UserOutputDto> {
    this.logger.verbose('signUp')
    const user = await this.usersService.create(body)
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastname: user.lastname,
      firstname: user.firstname,
      job: user.job,
      role: user.role,
    }
  }

  @Post('/list')
  @UsualApiOperation({
    summary: 'Lister les utilisateurs.',
    method: 'POST',
    minimumRole: Roles.admin,
    isPagination: true,
    responseType: null,
  })
  @HttpCode(200)
  @Role(Roles.admin)
  @ApiResponse({ status: 200 })
  async listUsers(
    @Body() dto: PaginationUserDto,
    @CurrentUser() user: IUser,
  ): Promise<PaginatedUserDto> {
    this.logger.verbose('listUsers')
    return this.usersService.listUsers(dto, user)
  }
}
