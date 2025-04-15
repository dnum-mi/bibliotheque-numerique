import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'
import { Client, custom, generators, Issuer } from 'openid-client'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { Roles, Prefecture, PrefectureDictionary } from '@biblio-num/shared'
import { RefreshToken } from '../objects/refresh-token.entity'
import { User } from '@/modules/users/objects/user.entity'
import { UserService } from '../../users/providers/user.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { SendMailService } from '@/modules/sendmail/sendmail.service'
import { AuthResponseDto } from '@/modules/users/objects/dtos/output'
import {
  UserinfoResponse,
  DecodedToken,
  CustomJwtSignOptions,
} from '@/modules/auth/auth.types'
import { durationToString } from '@/shared/utils/bn-code.utils'

@Injectable()
export class AuthService implements OnModuleInit {
  private client: Client

  constructor(
    private usersService: UserService,
    private logger: LoggerService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private sendMailService: SendMailService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.verbose('onModuleInit')
    try {
      const proxyUrl = this.configService.get('httpProxy')
      if (proxyUrl) {
        this.logger.log(`Using proxy: ${proxyUrl} for OpenID client`)
        const proxyAgent = new HttpsProxyAgent(proxyUrl)
        custom.setHttpOptionsDefaults({
          // @ts-ignore ça existe
          agent: proxyAgent,
        })
      } else {
        this.logger.log('No proxy for OpenID client')
      }

      const issuer = await Issuer.discover(
        this.configService.get('auth').discoveryUrl,
      )
      this.client = new issuer.Client({
        client_id: this.configService.get('auth').clientId,
        client_secret: this.configService.get('auth').clientSecret,
        redirect_uris: [this.configService.get('auth').redirectUri],
        response_types: ['code'],
        userinfo_signed_response_alg:
          this.configService.get('auth').userinfoSignedResponseAlg,
      })
    } catch (e) {
      this.logger.error("Couldn't initialize OpenID client")
      this.logger.error(e)
    }
  }

  async loginWithVerifyAuth(
    id: number,
    email: string,
  ): Promise<AuthResponseDto> {
    return this.createTokens(id, email, false)
  }

  async login(email: string, password: string): Promise<AuthResponseDto | undefined> {
    this.logger.verbose('login')

    const user: User = await this.usersService.findByEmail(email, [
      'id',
      'validated',
      'password',
      'email',
      'firstname',
      'lastname',
      'role',
    ])

    if (!user) {
      this.logger.warn('Email not found')
      throw new NotFoundException()
    }

    if (!user.validated) {
      this.logger.warn('User not validated')
      throw new NotFoundException()
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      this.logger.warn('Password incorrect')
      throw new NotFoundException()
    }

    if ([Roles.admin, Roles.superadmin].includes(user.role?.label)) {
      await this.send2FAEmail(user, email)
      return
    }

    this.logger.debug('User connected')
    this.logger.debug({ id: user.id, email: user.email, validated: user.validated })

    return this.createTokens(user.id, user.email, false)
  }

  private async send2FAEmail(user: User, email: string): Promise<void> {
    this.logger.verbose('send2FAEmail')
    // do not use the createJwtOnUrl of userService, we want the auth service context for the secret
    const expiresIn = this.configService.get('jwt').expiresIn
    const tokenOptions: CustomJwtSignOptions = {
      expiresIn,
    }
    const jwtForUrl =
      Buffer.from(
        this.jwtService.sign({ user: user.id }, tokenOptions),
      ).toString('base64url')
    const appUrl = this.configService.get('appFrontUrl')

    await this.sendMailService.loginWithVerifyAuth(
      email,
      user.firstname,
      user.lastname,
      `${appUrl}/verify-auth/${jwtForUrl}`,
      durationToString(expiresIn),
    )
  }

  async logout(refreshToken?: string): Promise<void> {
    this.logger.verbose('logout')
    if (!refreshToken) {
      this.logger.warn('refresh token is undefined')
      return
    }
    await this.refreshTokenRepository.delete({ refreshToken })
  }

  async createTokens(userId: number, userEmail: string, fromProConnect: boolean = false)
    : Promise<AuthResponseDto> {
    this.logger.verbose('createTokens')
    const payload = { sub: userId, email: userEmail }

    const accessOptions: CustomJwtSignOptions = {
      expiresIn: this.configService.get('auth').jwtExpireIn,
    }
    const refreshOptions: CustomJwtSignOptions = {
      expiresIn: this.configService.get('auth').jwtRefreshExpireIn,
    }

    const accessToken = this.jwtService.sign(payload, accessOptions)
    const refreshToken = this.jwtService.sign({ ...payload, iat: Math.floor(Date.now() / 1000) }, refreshOptions)
    await this.refreshTokenRepository.delete({ user: { id: userId } })
    await this.refreshTokenRepository.save({
      user: { id: userId },
      refreshToken,
      connectWithSso: fromProConnect,
    })

    return { accessToken, refreshToken }
  }

  async refreshToken(oldRefreshToken: string): Promise<AuthResponseDto> {
    this.logger.verbose('refreshToken')
    const payload = this.jwtService.verify(oldRefreshToken)

    const existingToken = await this.refreshTokenRepository.findOne({
      where: { refreshToken: oldRefreshToken, user: { id: payload.sub } },
      relations: ['user'],
    })

    if (!existingToken) {
      this.logger.warn(`user ${payload.sub}: refresh token not found`)
      throw new UnauthorizedException()
    }
    await this.refreshTokenRepository.delete(existingToken.refreshToken)
    const { accessToken, refreshToken }: AuthResponseDto = await this.createTokens(
      payload.sub, payload.email, false,
    )
    return { accessToken, refreshToken }
  }

  //#region 📍------ PRO CONNECT ------ 📍
  public async fetchProconnectUserInfo(req): Promise<UserinfoResponse> {
    this.logger.verbose('fetchProconnectUserInfo')
    const params = this.client.callbackParams(req)
    const jwtToken = req.cookies?.auth_token

    if (!jwtToken) {
      this.logger.warn('Missing authentication token')
      throw new UnauthorizedException()
    }

    const decodedToken = this.jwtService.verify<DecodedToken>(jwtToken, {
      secret: this.configService.get('auth').jwtSecret,
    })

    const { state, nonce } = decodedToken
    if (!state || !nonce) {
      this.logger.warn('Missing required parameters: state or nonce')
      throw new UnauthorizedException()
    }

    const tokenResponse = await this.client.callback(
      this.configService.get('auth').redirectUri,
      params,
      { state, nonce },
    )

    return await this.client.userinfo(tokenResponse.access_token)
  }

  proconnect(): { url: string; token: string } {
    this.logger.verbose('proconnect')
    if (this.configService.get('auth').disableSso) {
      throw new InternalServerErrorException('SSO not enabled')
    }

    if (!this.client) {
      throw new InternalServerErrorException('OpenID Client is not initialized')
    }

    const state = generators.state()
    const nonce = generators.nonce()

    const authorizationUrl = this.client.authorizationUrl({
      scope: 'openid profile email',
      state,
      nonce,
    })

    const accessOptions: CustomJwtSignOptions = { expiresIn: this.configService.get('auth').expirationTokenProconnect }
    const token = this.jwtService.sign({ state, nonce }, accessOptions)

    return { url: authorizationUrl, token }
  }

  async proconnectCallback(req): Promise<AuthResponseDto> {
    this.logger.verbose('proconnectCallback')
    if (this.configService.get('auth').disableSso) {
      throw new InternalServerErrorException('SSO not enabled')
    }
    const userinfoResponse = await this.fetchProconnectUserInfo(req)

    if (!userinfoResponse.email) {
      this.logger.warn('Email not provided')
      throw new UnauthorizedException()
    }

    let user: User = await this.usersService.findByEmail(
      userinfoResponse.email,
      ['id', 'email'],
    )

    if (!user) {
      user = await this.usersService.createAndSave({
        email: userinfoResponse.email,
        firstname: userinfoResponse.given_name || '',
        lastname: userinfoResponse.family_name || '',
        job: '',
        prefecture: PrefectureDictionary[Prefecture.D75],
        password: randomBytes(12)
          .toString('base64')
          .slice(0, 12)
          .replace(/\W/g, 'A'),
        validated: true,
      })
    }

    return this.createTokens(user.id, user.email, true)
  }
  //#endregion
}
