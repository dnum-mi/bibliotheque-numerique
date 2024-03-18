// TODO: Remove this eslint-disable
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module } from '@nestjs/common'
import { MailerModule } from '@nestjs-modules/mailer'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter'

import { SendMailService } from './sendmail.service'
import { NodeEnvs } from '../../shared/types/node-env.enum'

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const templatePath = process.env.NODE_ENV === NodeEnvs.TestUnit ? __dirname : 'dist/modules/sendmail'
        const template = {
          dir: `${templatePath}/templates`,
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        }

        if (process.env.NODE_ENV === NodeEnvs.TestUnit) {
          return {
            transport: {
              host: 'localhost',
              port: 1025,
            },
            template,
            defaults: {
              from: 'defaults@test.com',
            },
          }
        }

        const { host, port, from, user, pass } = configService.get('smtp')
        const transport: Record<string, any> = {
          host,
          port,
        }

        if (user) {
          transport.ignoreTLS = true
          transport.secure = false
          transport.auth = {
            user,
            pass,
          }
        }

        const options: Record<string, any> = {
          transport,
          template,
        }

        if (from) {
          options.defaults = {
            from,
          }
        }

        return options
      },
      inject: [ConfigService],
    }),
  ],
  providers: [SendMailService],
  exports: [SendMailService],
})
export class SendMailModule {}
