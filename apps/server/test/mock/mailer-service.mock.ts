import { MailerService } from "@nestjs-modules/mailer";

export const mailerServiceMock: Partial<MailerService> = {
  sendMail: jest.fn(),
};
