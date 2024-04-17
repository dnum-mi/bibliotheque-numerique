import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserService } from '../providers/user.service'
import { UpdatePasswordGuard } from '@/modules/users/providers/guards/update-password.guard'
import { ValidSignUpGuard } from '@/modules/users/providers/guards/validate-sign-up.guard'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { PublicRoute } from '@/modules/users/providers/decorators/public-route.decorator'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CurrentUser } from '@/modules/users/providers/decorators/current-user.decorator'
import { User } from '../objects/user.entity'
import {
  ResetPasswordInputDto,
  UpdateProfileDto,
  UpdateUserPasswordDto,
} from '@/modules/users/objects/dtos/input'
import { UserOutputDto } from '@/modules/users/objects/dtos/output'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'

@ApiTags('Users', 'Me')
@Controller('users')
export class UserMeController {
  constructor(
    private readonly usersService: UserService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get('/me')
  @UsualApiOperation({
    summary: "Retourne l'utilisateur connecté.",
    method: 'GET',
    minimumRole: 'aucun',
    responseType: UserOutputDto,
  })
  @Role('any')
  async getProfile(@CurrentUser() user: User): Promise<UserOutputDto> {
    this.logger.verbose({ fn: 'getProfile' })
    return this.usersService.profile(user)
  }

  @Put('/me/password')
  @UsualApiOperation({
    summary: 'Mettre à jour son mot de passe.',
    method: 'PUT',
    minimumRole: 'aucun',
    supplement:
      "Nécessite un token envoyé par email pour sécuriser l'opération.",
    responseType: null,
  })
  @PublicRoute()
  @UseGuards(UpdatePasswordGuard)
  async updatePassword(
    @Request() req,
    @Body() body: UpdateUserPasswordDto,
  ): Promise<void> {
    this.logger.verbose('updatePassword')
    await this.usersService.updatePassword(req.user, body.password)
  }

  @Post('/me/reset-password')
  @UsualApiOperation({
    summary: 'Reset de mot de passe.',
    method: 'POST',
    minimumRole: 'aucun',
    responseType: null,
    supplement:
      'Envoie un email pour réinitialiser le mot de passe qui contiendra le token utilisable dans PUT /users',
  })
  @PublicRoute()
  async resetPassword(@Body() body: ResetPasswordInputDto): Promise<boolean> {
    this.logger.verbose('resetPassword')
    await this.usersService.resetPassword(body.email)
    return true
  }

  @Post('/me/valid-email')
  @UsualApiOperation({
    summary: 'Valider un email.',
    method: 'POST',
    minimumRole: 'aucun',
    responseType: null,
    supplement:
      'Route publique envoyer dans l\'email avec un token pour valider une adresse email.',
  })
  @PublicRoute()
  @UseGuards(ValidSignUpGuard)
  async validSignUp(@Request() req): Promise<void> {
    this.logger.verbose('validSignUp')
    return await this.usersService.validEmail(req.user)
  }

  @Patch('/me')
  @UsualApiOperation({
    summary: 'Modifier son profile.',
    method: 'PATCH',
    minimumRole: 'aucun',
    responseType: null,
    supplement:
      'Modifier les informations basiques du profile.',
  })
  @Role('any')
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    this.logger.verbose('updateProfile')
    await this.usersService.updateOrThrow(user.id, dto)
    return true
  }
}
