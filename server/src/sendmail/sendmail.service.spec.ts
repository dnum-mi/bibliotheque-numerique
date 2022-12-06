import { MailerService } from "@nestjs-modules/mailer";
import { Test, TestingModule } from "@nestjs/testing";
import { SendMailService } from "./sendmail.service";

describe("SendMailService", () => {
  let service: SendMailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendMailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: async () => {
              return;
            },
          },
        },
      ],
    }).compile();
    service = module.get<SendMailService>(SendMailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should be send example mail", () => {
    let result;
    jest.spyOn(mailerService, "sendMail").mockImplementation((obj) => {
      result = obj;
      return Promise.resolve();
    });
    service.example();
    expect(result).toBeDefined();
  });
});
