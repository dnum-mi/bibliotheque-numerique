import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SendMailService } from "./sendmail.service";
import { TConfig } from "config/configuration";
import { EjsAdapter } from "@nestjs-modules/mailer/dist/adapters/ejs.adapter";
import { NodeEnv } from "../../shared/types/node-env.enum";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const templatePath =
          process.env.NODE_ENV === NodeEnv.TestUnit
            ? __dirname
            : "dist/modules/sendmail";
        const template = {
          dir: `${templatePath}/templates`,
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        };

        if (process.env.NODE_ENV === NodeEnv.TestUnit) {
          return {
            transport: {
              host: "localhost",
              port: 1025,
            },
            template,
            defaults: {
              from: "defaults@test.com",
            },
          };
        }

        const { host, port, from, user, pass } = configService.get("smtp");
        const transport = {
          host,
          port,
        };

        if (user) {
          transport["ignoreTLS"] = true;
          transport["secure"] = false;
          transport["auth"] = {
            user,
            pass,
          };
        }

        const options = {
          transport,
          template,
        };

        if (from) {
          options["defaults"] = {
            from,
          };
        }

        return options;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [SendMailService],
  exports: [SendMailService],
})
export class SendMailModule {}
