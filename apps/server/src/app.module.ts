import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import configuration from "./config/configuration";
import fileConfig from "./config/file.config";
import dsConfig from "./config/ds.config";
import { AppDataSource } from "./db/app-data-source";
import { DemarchesModule } from "./demarches/demarches.module";
import { DemarchesDSModule } from "./demarches_ds/demarches_ds.module";
import { DossiersModule } from "./dossiers/dossiers.module";
import { DossiersDSModule } from "./dossiers_ds/dossiers_ds.module";
import { RolesModule } from "./roles/roles.module";
import { LoggerModule } from "./logger/logger.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ConnectorModule } from "./connector/connector.module";
import { FilesModule } from "./files/files.module";
import { pluginsModules } from "./plugins";
import { JobLogModule } from "./modules/job-log/job-log.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration, fileConfig, dsConfig],
    }),
    LoggerModule,
    TypeOrmModule.forRoot(AppDataSource.options),
    DemarchesModule,
    DemarchesDSModule,
    DossiersModule,
    DossiersDSModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ConnectorModule,
    FilesModule,
    ...pluginsModules,

    // TODO: AppModule use JobModule for now to retrieve JobLogService
    JobLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
