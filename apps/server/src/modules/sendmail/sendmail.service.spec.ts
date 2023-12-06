import { Test, TestingModule } from '@nestjs/testing'
import { SendMailService } from './sendmail.service'
import { SendMailModule } from './sendmail.module'
import * as SMTPTransport from 'nodemailer/lib/smtp-transport'
import MailMessage from 'nodemailer/lib/mailer/mail-message'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../../test/mock/logger-service.mock'
import { ConfigService } from '@nestjs/config'

/**
 * Code spyOnSmtpSend is from https://github.com/nest-modules/mailer/blob/master/lib/mailer.service.spec.ts
 * Common testing code for spying on the SMTPTransport's send() implementation
 */
const spyOnSmtpSend = (onMail: (mail: MailMessage) => void): jest.SpyInstance => {
  return jest
    .spyOn(SMTPTransport.prototype, 'send')
    .mockImplementation(function (
      mail: MailMessage,
      callback: (err: Error | null, info: SMTPTransport.SentMessageInfo) => void,
    ): void {
      onMail(mail)
      callback(null, {
        envelope: {
          from: mail.data.from as string,
          to: [mail.data.to as string],
        },
        messageId: 'ABCD',
        accepted: [],
        rejected: [],
        pending: [],
        response: 'ok',
      })
    })
}

describe('SendMailService', () => {
  let service: SendMailService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SendMailModule],
    })
      .useMocker((token) => {
        if (token === LoggerService) {
          return loggerServiceMock
        } else if (token === ConfigService) {
          return {
            get: () => 'fake-conf',
          }
        }
      })
      .compile()
    service = module.get<SendMailService>(SendMailService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should  get mail from one template', async () => {
    const email = 'test.test@exemple.com'
    let result
    spyOnSmtpSend((obj: MailMessage) => {
      result = obj
    })
    await service.validSignUp(email, 'some-first-name', 'some-last-name', 'some-url')
    expect(result).toBeDefined()
    expect(result).toHaveProperty('data')
    expect(result.data).toHaveProperty('to', email)
    expect(result.data).toHaveProperty('from', 'defaults@test.com')
    expect(result.data).toHaveProperty('subject', expect.stringMatching(/Confirmer votre inscription/))
    expect(result.data.html.match(new RegExp(email))).toBeTruthy()
    expect(result.data.html.match(/some-first-name/)).toBeTruthy()
    expect(result.data.html.match(/SOME-LAST-NAME/)).toBeTruthy()
    expect(result.data.html.match(/some-url/)).toBeTruthy()
  })
})
