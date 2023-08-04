import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { LoggerService } from "../../shared/modules/logger/logger.service";

@Injectable()
export class SendMailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  public async welcome(to: string): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: "Bienvenue",
      template: "welcome",
      context: {
        email: to,
      },
    });
    this.logger.log(`Send Mail ${to}`);
  }

  // TODO: A vérifier l'utilité et template à completer
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public async resetPwd(to: string, urlResetLink: string) {
    const subject = "Modifier son mot de passe";
    await this.mailerService.sendMail({
      to,
      subject,
      template: "resetPwd",
      context: {
        urlResetLink,
      },
    });
    this.logger.log(`Send Mail to ${to} with the subject ${subject}`);
  }
}
