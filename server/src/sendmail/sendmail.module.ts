import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SendMailService } from "./sendmail.service";
import { TConfig } from "config/configuration";
import { EjsAdapter } from "@nestjs-modules/mailer/dist/adapters/ejs.adapter";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const template = {
          dir: `${__dirname}/../templates`,
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        };

        if (process.env.NODE_ENV === "test") {
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

        const { host, port, from, user, pass } =
          configService.get<TConfig["smtp"]>("smtp");
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
