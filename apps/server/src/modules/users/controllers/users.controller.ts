import {
  Body,
  Controller,
  Get, HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { UsersService } from '../providers/users.service'
import {
  CreateUserDto,
  UpdateUserPasswordDto,
  ResetPasswordInputDto,
  UserOutputDto,
  Roles,
  PaginationUserDto,
  PaginatedUserDto,
} from '@biblio-num/shared'
import { UpdatePasswordGuard } from '@/modules/users/providers/guards/update-password.guard'
import { ValidSignUpGuard } from '@/modules/users/providers/guards/validate-sign-up.guard'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { PublicRoute } from '@/modules/users/providers/decorators/public-route.decorator'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CurrentUser } from '@/modules/users/providers/decorators/current-user.decorator'
import { User } from '@/modules/users/entities/user.entity'

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor (private readonly usersService: UsersService, private logger: LoggerService) {
    this.logger.setContext(this.constructor.name)
  }

  @Post()
  @PublicRoute()
  async signUp (@Body() body: CreateUserDto): Promise<UserOutputDto> {
    this.logger.verbose('signUp')
    const user = await this.usersService.create(body)
    return {
      id: user.id,
      email: user.email,
      createAt: user.createAt,
      updateAt: user.updateAt,
      lastname: user.lastname,
      firstname: user.firstname,
      job: user.job,
      role: user.role,
    }
  }

  @Put()
  @PublicRoute()
  @UseGuards(UpdatePasswordGuard)
  async updatePassword (@Request() req, @Body() body: UpdateUserPasswordDto): Promise<void> {
    this.logger.verbose('updatePassword')
    await this.usersService.updatePassword(req.user, body.password)
  }

  @Post('/list')
  @HttpCode(200)
  @Role(Roles.admin)
  @ApiResponse({ status: 200 })
  async listUsers (@Body() dto: PaginationUserDto): Promise<PaginatedUserDto> {
    this.logger.verbose('listUsers')
    return this.usersService.paginate(dto)
  }

  @Get('/me')
  @Role('any')
  getProfile(@CurrentUser() user: User): Promise<UserOutputDto> {
    this.logger.verbose('getProfile')
    return this.usersService.enrichProfileWithDemarche(user)
  }

  @Get('/:id')
  @Role(Roles.admin)
  async getUserById (
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserOutputDto> {
    this.logger.verbose('getUserById')
    return this.usersService.getUserById(id)
  }

  @Post('/reset-password')
  @PublicRoute()
  async resetPassword (@Body() body: ResetPasswordInputDto): Promise<boolean> {
    this.logger.verbose('resetPassword')
    await this.usersService.resetPassword(body.email)
    return true
  }

  @Post('/valid-email')
  @PublicRoute()
  @UseGuards(ValidSignUpGuard)
  async validSignUp (@Request() req): Promise<void> {
    this.logger.verbose('validSignUp')
    return await this.usersService.validEmail(req.user)
  }
}
