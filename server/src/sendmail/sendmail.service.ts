import { Injectable, Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { LoggerService } from "logger/logger.service";

@Injectable()
export class SendMailService {
  constructor(private readonly mailerService: MailerService) {}

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
}
