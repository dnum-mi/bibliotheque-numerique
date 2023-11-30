import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { LoggerService } from '../../shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'

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
    template: 'resetPwd' | 'validSignUp',
  ): Promise<void> {
    const subject =
      template === 'resetPwd'
        ? 'Modifier son mot de passe'
        : 'Confirmer votre inscription'
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
  ): Promise<void> {
    return this._commonSend(
      email,
      firstname,
      lastname,
      urlResetLink,
      'resetPwd',
    )
  }

  public async validSignUp(
    email: string,
    firstname: string,
    lastname: string,
    urlResetLink: string,
  ): Promise<void> {
    return this._commonSend(
      email,
      firstname,
      lastname,
      urlResetLink,
      'validSignUp',
    )
  }
}
