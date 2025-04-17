import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { LoggerService } from '../../shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import { createEnum } from '@biblio-num/shared'

const tempateNames = [
  'resetPwd',
  'validSignUp',
  'alreadySignUp',
  'loginWithVerifyAuth',
  'resetPasswordAfterThreeAttempts',
] as const

type templateNameKey = typeof tempateNames[number]
const eTemplateName = createEnum(tempateNames)

@Injectable()
export class SendMailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private async _commonSend(
    email: string,
    firstname: string,
    lastname: string,
    link: string,
    template: templateNameKey,
    duration?: string,
  ): Promise<void> {
    const subjects = {
      [eTemplateName.resetPwd]: 'Modifier son mot de passe',
      [eTemplateName.validSignUp]: 'Confirmer votre inscription',
      [eTemplateName.alreadySignUp]: 'Déjà inscrit',
      [eTemplateName.loginWithVerifyAuth]: 'Confirmer votre connexion',
      [eTemplateName.resetPasswordAfterThreeAttempts]: 'Votre compte a été temporairement bloqué — Action requise',
    }
    const subject = subjects[template]
    await this.mailerService.sendMail({
      to: email,
      subject,
      template,
      context: {
        link,
        email,
        firstname,
        lastname,
        appUrl: this.config.get('appFrontUrl'),
        supportEmail: this.config.get('supportEmail'),
        duration,
      },
    })
    this.logger.log(`Send Mail to ${email} with the subject ${subject}`)
  }

  // TODO: A vérifier l'utilité et template à completer
  public async resetPwd(
    email: string,
    firstname: string,
    lastname: string,
    urlResetLink: string,
    duration: string,
  ): Promise<void> {
    return this._commonSend(
      email,
      firstname,
      lastname,
      urlResetLink,
      eTemplateName.resetPwd,
      duration,
    )
  }

  public async loginWithVerifyAuth(
    email: string,
    firstname: string,
    lastname: string,
    urlResetLink: string,
    duration: string,
  ): Promise<void> {
    return this._commonSend(
      email,
      firstname,
      lastname,
      urlResetLink,
      eTemplateName.loginWithVerifyAuth,
      duration,
    )
  }

  public async resetPasswordAfterThreeAttempts(
    email: string,
    firstname: string,
    lastname: string,
    urlResetLink: string,
    duration: string,
  ): Promise<void> {
    return this._commonSend(
      email,
      firstname,
      lastname,
      urlResetLink,
      eTemplateName.resetPasswordAfterThreeAttempts,
      duration,
    )
  }

  public async validSignUp(
    email: string,
    firstname: string,
    lastname: string,
    urlResetLink: string,
    duration: string,
  ): Promise<void> {
    return this._commonSend(
      email,
      firstname,
      lastname,
      urlResetLink,
      eTemplateName.validSignUp,
      duration,
    )
  }

  public async alreadySignUp(
    email: string,
    firstname: string,
    lastname: string,
    urlResetLink: string,
    duration: string,
  ): Promise<void> {
    return this._commonSend(
      email,
      firstname,
      lastname,
      urlResetLink,
      eTemplateName.alreadySignUp,
      duration,
    )
  }
}
