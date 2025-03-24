import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  HttpCode,
  Res,
  Req,
  Delete,
} from '@nestjs/common'
import { Request as ExpressRequest } from 'express'
import { ApiTags } from '@nestjs/swagger'
import { AuthService } from '../providers/auth.service'
import { PublicRoute } from '@/modules/users/providers/decorators/public-route.decorator'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { AuthResponseDto, AuthProconnectResponseDto, UserOutputDto } from '@/modules/users/objects/dtos/output'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { ConfigService } from '@nestjs/config'
import { Role } from '@/modules/users/providers/decorators/role.decorator'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private setRefreshTokenCookie(res, refreshToken: string): void {
    const jwtRefreshExpireIn = this.configService.get('auth').jwtRefreshExpireIn
    const days = parseInt(jwtRefreshExpireIn, 10)
    const maxAge = (days * 24 * 60 * 60 * 1000) + 1000
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge,
    })
  }

  @Role('any')
  @Delete('logout')
  @HttpCode(200)
  @UsualApiOperation({
    summary: 'Logout user',
    method: 'DELETE',
    minimumRole: 'aucun',
    responseType: null,
  })
  async logout(@Req() req, @Res() res): Promise<void> {
    await this.authService.logout(req.cookies?.refreshToken)

    res.clearCookie('refreshToken', {
      httpOnly: true,
    })

    res.send()
  }

  @PublicRoute()
  @Post('sign-in')
  @HttpCode(200)
  @UsualApiOperation({
    summary: 'Login with email and password',
    method: 'POST',
    minimumRole: 'aucun',
    responseType: AuthResponseDto,
  })
  async login(
    @Body() { email, password }: { email: string; password: string },
    @Res() res,
  ): Promise<void> {
    const { accessToken, refreshToken } = await this.authService.login(email, password)
    this.setRefreshTokenCookie(res, refreshToken)
    res.send({ accessToken })
  }

  @PublicRoute()
  @Post('refresh')
  @HttpCode(200)
  @UsualApiOperation({
    summary: 'Refresh token endpoint',
    method: 'POST',
    minimumRole: 'aucun',
    responseType: AuthResponseDto,
  })
  async refresh(
    @Req() req,
    @Res() res,
  ): Promise<void> {
    const { accessToken, refreshToken } = await this.authService.refreshToken(req.cookies.refreshToken)
    this.setRefreshTokenCookie(res, refreshToken)
    res.send({ accessToken })
  }

  @PublicRoute()
  @Get('proconnect')
  @UsualApiOperation({
    summary: 'Get proconnect url',
    method: 'GET',
    minimumRole: 'aucun',
    responseType: AuthProconnectResponseDto,
  })
  async getProConnectUrl(
    @Res() res,
  ): Promise<void> {
    const { token, url } = this.authService.proconnect()
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: this.configService.get('auth').proConnectAuthTokenMaxAge,
    })
    res.send({ url })
  }

  @PublicRoute()
  @Post('proconnect/callback')
  @UsualApiOperation({
    summary: 'Proconnect callback',
    method: 'POST',
    minimumRole: 'aucun',
    responseType: UserOutputDto,
  })
  async proConnectCallback(
    @Request() req: ExpressRequest,
    @Res() res,
  ): Promise<void> {
    const { accessToken, refreshToken } = await this.authService.proconnectCallback(req)
    this.setRefreshTokenCookie(res, refreshToken)
    res.send({ accessToken })
  }
}
