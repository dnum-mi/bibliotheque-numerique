import { Injectable, Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { LoggerService } from "shared/modules/logger/logger.service";

@Injectable()
export class SendMailService {
  constructor(private readonly mailerService: MailerService) {}

  private readonly logger = new Logger(
    SendMailService.name,
  ) as unknown as LoggerService;

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public async welcome(to: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: "Bienvenue",
        template: "welcome",
        context: {
          email: to,
        },
      });
      this.logger.log(`Send Mail ${to}`);
    } catch (error) {
      this.logger.error({
        short_message: error.message,
        full_message: JSON.stringify(error),
      });
      throw error;
    }
  }

  //TODO: A vérifier l'utilité et template à completer
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public async resetPwd(to: string, urlResetLink: string) {
    try {
      const subject = "Changement de mot de passe";
      await this.mailerService.sendMail({
        to,
        subject,
        template: "resetPwd",
        context: {
          urlResetLink,
        },
      });
      this.logger.log(`Send Mail to ${to} with the subject ${subject}`);
    } catch (error) {
      this.logger.error({
        short_message: error.message,
        full_message: JSON.stringify(error),
      });
      throw error;
    }
  }
}
