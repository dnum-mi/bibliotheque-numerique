import { MailerService } from "@nestjs-modules/mailer";
import { Test, TestingModule } from "@nestjs/testing";
import { SendMailService } from "./sendmail.service";
import { SendMailModule } from "./sendmail.module";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";
import MailMessage from "nodemailer/lib/mailer/mail-message";
import { ConfigModule } from "@nestjs/config";
import configuration from "../config/configuration";
import fileConfig from "../config/file.config";
import dsConfig from "../config/ds.config";

/**
 * Code spyOnSmtpSend is from https://github.com/nest-modules/mailer/blob/master/lib/mailer.service.spec.ts
 * Common testing code for spying on the SMTPTransport's send() implementation
 */
function spyOnSmtpSend(onMail: (mail: MailMessage) => void) {
  return jest
    .spyOn(SMTPTransport.prototype, "send")
    .mockImplementation(function (
      mail: MailMessage,
      callback: (
        err: Error | null,
        info: SMTPTransport.SentMessageInfo,
      ) => void,
    ): void {
      onMail(mail);
      callback(null, {
        envelope: {
          from: mail.data.from as string,
          to: [mail.data.to as string],
        },
        messageId: "ABCD",
        accepted: [],
        rejected: [],
        pending: [],
        response: "ok",
      });
    });
}

describe("SendMailService", () => {
  let service: SendMailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SendMailModule],
    }).compile();
    service = module.get<SendMailService>(SendMailService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should  get mail from one template", async () => {
    const email = "test.test@exemple.com";
    let result;
    spyOnSmtpSend((obj: MailMessage) => {
      result = obj;
    });
    await service.welcome(email);
    expect(result).toBeDefined();
    expect(result).toHaveProperty("data");
    expect(result.data).toHaveProperty("to", email);
    expect(result.data).toHaveProperty("from", "defaults@test.com");
    expect(result.data).toHaveProperty(
      "subject",
      expect.stringMatching(/Bienvenue/),
    );
    expect(result.data).toHaveProperty(
      "html",
      expect.stringMatching(/Bibliothèque Numérique/),
    );
    expect(result.data).toHaveProperty(
      "html",
      expect.stringMatching("Bienvenue"),
    );
    expect(result.data).toHaveProperty(
      "html",
      expect.stringMatching(new RegExp(email)),
    );
  });
});
