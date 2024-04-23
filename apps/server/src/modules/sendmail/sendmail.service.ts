import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { LoggerService } from '../../shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import { createEnum } from '@biblio-num/shared'

const tempateNames = [
  'resetPwd',
  'validSignUp',
  'alreadySignUp',
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
  ): Promise<void> {
    const subjects = {
      [eTemplateName.resetPwd]: 'Modifier son mot de passe',
      [eTemplateName.validSignUp]: 'Confirmer votre inscription',
      [eTemplateName.alreadySignUp]: 'Déjà inscrit',
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
      eTemplateName.resetPwd,
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
      eTemplateName.validSignUp,
    )
  }

  public async alreadySignUp(
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
      eTemplateName.alreadySignUp,
    )
  }
}
