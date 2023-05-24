import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import configuration from "./config/configuration";
import fileConfig from "./config/file.config";
import dsConfig from "./config/ds.config";
import { AppDataSource } from "./db/app-data-source";
import { DemarchesModule } from "./modules/demarches/demarches.module";
import { DemarchesDSModule } from "./modules/demarches_ds/demarches_ds.module";
import { DossiersModule } from "./modules/dossiers/dossiers.module";
import { DossiersDSModule } from "./modules/dossiers_ds/dossiers_ds.module";
import { RolesModule } from "./modules/roles/roles.module";
import { LoggerModule } from "./modules/logger/logger.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ConnectorModule } from "./modules/connector/connector.module";
import { FilesModule } from "./modules/files/files.module";
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
