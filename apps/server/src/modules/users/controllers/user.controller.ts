import {
  Body,
  Controller,
  Get, HttpCode,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { UserService } from '../providers/user.service'
import {
  CreateUserDto,
  UpdateUserPasswordDto,
  ResetPasswordInputDto,
  UserOutputDto,
  Roles,
  PaginationUserDto,
  PaginatedUserDto, IUser,
  UpdateProfileDto,
} from '@biblio-num/shared'
import { UpdatePasswordGuard } from '@/modules/users/providers/guards/update-password.guard'
import { ValidSignUpGuard } from '@/modules/users/providers/guards/validate-sign-up.guard'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { PublicRoute } from '@/modules/users/providers/decorators/public-route.decorator'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CurrentUser } from '@/modules/users/providers/decorators/current-user.decorator'
import { User } from '../objects/user.entity'

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor (private readonly usersService: UserService, private logger: LoggerService) {
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
  async listUsers (@Body() dto: PaginationUserDto, @CurrentUser() user: IUser): Promise<PaginatedUserDto> {
    this.logger.verbose('listUsers')
    return this.usersService.listUsers(dto, user)
  }

  @Get('/me')
  @Role('any')
  async getProfile(@CurrentUser() user: User): Promise<UserOutputDto> {
    this.logger.verbose({ fn: 'getProfile' })
    return this.usersService.profile(user)
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

  @Patch('/me')
  @Role('any')
  async updateProfile(@Body() dto: UpdateProfileDto, @CurrentUser() user: User): Promise<boolean> {
    this.logger.verbose('updateProfile')
    await this.usersService.updateOrThrow(user.id, dto)
    return true
  }
}
