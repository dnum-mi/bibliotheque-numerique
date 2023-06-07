import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import generalConf from "./config/general.config";
import logConf from "./config/logger.config";
import dsConf from "./config/ds.config";
import { LoggerModule } from "@/shared/modules/logger/logger.module";
import { FoundationModule } from "@/modules/foundation/foundation.module";
import { PrismaModule } from "@/shared/modules/prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [generalConf, logConf, dsConf],
    }),
    LoggerModule,
    PrismaModule,
    FoundationModule,
  ],
})
export class AppModule {}
