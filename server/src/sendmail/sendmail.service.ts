import { Injectable, Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { LoggerService } from "logger/logger.service";
import { from } from "rxjs";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SendMailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configServie: ConfigService,
  ) { }

  private readonly logger = new Logger(
    SendMailService.name,
  ) as unknown as LoggerService;

  //TODO: Exemple à modifier
  public example(): void {
    this.logger.log("test send mail");
    this.mailerService
      .sendMail({
        to: "test@nestjs.com", // list of receivers
        from: "noreply@nestjs.com", // sender address
        subject: "Testing Nest MailerModule ✔", // Subject line
        text: "welcome", // plaintext body
        html: "<b>welcome</b>", // HTML body content
      })
      .then(() => {
        this.logger.log("Send Mail");
      })
      .catch((error) => {
        this.logger.error(error);
        throw error;
      });
  }

  public resetPassword(to: string): void {
    this.mailerService
      .sendMail({
        to,
        subject: "Bienvenue",
        template: "welcome",
      })
      .then(() => {
        this.logger.log(`Send Mail ${to}`);
      })
      .catch((error) => {
        console.log(error);
        this.logger.error({
          short_message: error.message,
          full_message: JSON.stringify(error),
        });
        throw error;
      });
  }
}
