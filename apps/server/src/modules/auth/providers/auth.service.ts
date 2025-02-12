import {
  BadRequestException,
  Injectable, InternalServerErrorException, NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { UserService } from '../../users/providers/user.service'
import * as bcrypt from 'bcrypt'
import { User } from '@/modules/users/objects/user.entity'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CredentialsInputDto } from '@/modules/users/objects/dtos/input'
import { UserOutputDto } from '@/modules/users/objects/dtos/output'
import { Client, custom, generators, Issuer } from 'openid-client'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { promisify } from 'util'
import { randomBytes } from 'crypto'
import { ConfigService } from '@nestjs/config'

interface UserinfoResponse {
  email?: string;
  given_name?: string;
  family_name?: string;
  access_token?: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private client: Client
  constructor(
    private usersService: UserService,
    private logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
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

      const issuer = await Issuer.discover(this.configService.get('auth').discoveryUrl)
      this.client = new issuer.Client({
        client_id: this.configService.get('auth').clientId,
        client_secret: this.configService.get('auth').clientSecret,
        redirect_uris: [this.configService.get('auth').redirectUri],
        response_types: ['code'],
        userinfo_signed_response_alg: this.configService.get('auth').userinfoSignedResponseAlg,
      })
    } catch (e) {
      this.logger.error("Couldn't initialize OpenID client")
      this.logger.error(e)
    }
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<User | undefined> {
    this.logger.verbose('validateUser')
    const user: User = await this.usersService.findByEmail(email, [
      'id',
      'email',
      'lastname',
      'firstname',
      'job',
      'validated',
      'password',
      'role',
      'createdAt',
      'updatedAt',
    ])
    if (!user) {
      throw new NotFoundException('User not found')
    }
    if (!user.validated) {
      throw new NotFoundException('Invalid e-mail')
    }
    const isMatch: boolean = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new NotFoundException('Invalid credentials')
    }
    this.logger.debug('User connected')
    this.logger.debug(user)
    delete user.validated
    delete user.password
    return user
  }

  async login(dto: CredentialsInputDto): Promise<UserOutputDto> {
    this.logger.verbose(`login (${dto.email})`)
    const findUser: User = await this.usersService.findByEmail(dto.email, [
      'id',
      'email',
      'role',
    ])
    // eslint-disable-next-line
    // @ts-ignore TODO: role refacto
    return {
      id: findUser.id,
      email: findUser.email,
      role: findUser.role,
    }
  }

  proconnect(session): { url: string } {
    if (this.configService.get('auth').disableSso) {
      this.logger.verbose('SSO not enabled')
      throw new InternalServerErrorException('SSO not enabled')
    }
    const state = generators.state()
    const nonce = generators.nonce()
    session.nonce = nonce

    if (!this.client) {
      this.logger.verbose('OpenID Client is not initialized')
      throw new NotFoundException('OpenID Client is not initialized')
    }

    const authorizationUrl = this.client.authorizationUrl({
      scope: 'openid profile email',
      state,
      nonce,
    })

    return { url: authorizationUrl }
  }

  public async fetchUserinfo(req): Promise<UserinfoResponse> {
    const params = this.client.callbackParams(req)
    const tokenResponse = await this.client.callback(
      this.configService.get('auth').redirectUri,
      params,
      { state: req.body.state, nonce: req.session.nonce },
    )

    return await this.client.userinfo(tokenResponse.access_token)
  }

  async proconnectCallback(req): Promise<UserOutputDto> {
    if (this.configService.get('auth').disableSso) {
      this.logger.verbose('SSO not enabled')
      throw new InternalServerErrorException('SSO not enabled')
    }
    const userinfoResponse = await this.fetchUserinfo(req)

    if (!userinfoResponse.email) {
      throw new BadRequestException('Email not provided')
    }

    let user: User = await this.usersService.findByEmail(userinfoResponse.email, [
      'id', 'email', 'validated', 'role',
      'firstname', 'lastname', 'job', 'createdAt', 'updatedAt',
    ])

    if (!user) {
      user = await this.usersService.createAndSave({
        email: userinfoResponse.email,
        firstname: userinfoResponse.given_name || '',
        lastname: userinfoResponse.family_name || '',
        job: '',
        password: randomBytes(12).toString('base64').slice(0, 12).replace(/\W/g, 'A'),
        validated: true,
      })
    }

    const logInUser = promisify(req.logIn).bind(req)
    await logInUser(user)

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstname: user.firstname,
      lastname: user.lastname,
      job: user.job,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
