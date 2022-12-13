import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SendMailService } from "./sendmail.service";
import { TConfig } from "config/configuration";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
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

        if (from) {
          transport["defaults"] = {
            from,
          };
        }
        return {
          transport,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [SendMailService],
})
export class SendMailModule {}
