import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import generalConf from "./config/main.config";
import logConf from "./config/logger.config";
import { LoggerModule } from "@/modules/logger/logger.module";
import { PrismaService } from "@/shared/providers/prisma.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [generalConf, logConf],
    }),
    LoggerModule,
  ],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
