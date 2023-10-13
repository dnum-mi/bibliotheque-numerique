import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CredentialsInputDto, UserOutputDto } from '@biblio-num/shared'
import { AuthService } from '../providers/auth.service'
import { PublicRoute } from '@/modules/users/providers/decorators/public-route.decorator'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { LocalAuthGuard } from '@/modules/auth/providers/local.guard'

/* The TODO: of this file must be done after creating what nestjs calls "tests" */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @HttpCode(200)
  @PublicRoute()
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signIn(@Body() body: CredentialsInputDto): Promise<UserOutputDto> {
    this.logger.verbose('signIn')
    return this.authService.login(body)
  }

  @Delete('/')
  @PublicRoute()
  async logout(@Request() req, @Response() res, next): Promise<void> {
    this.logger.verbose('logout')
    req.logout(function (err) {
      if (err) {
        return next(err)
      }

      res.send({ success: true })
    })
  }
}
