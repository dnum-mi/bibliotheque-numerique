import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import configuration from "./config/configuration";
import fileConfig from "./config/file.config";
import dsConfig from "./config/ds.config";
import { AppDataSource } from "./db/app-data-source";
import { DemarchesModule } from "./modules/demarches/demarches.module";
import { DossiersModule } from "./modules/dossiers/dossiers.module";
import { RolesModule } from "./modules/roles/roles.module";
import { LoggerModule } from "./modules/logger/logger.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ConnectorModule } from "./modules/connector/connector.module";
import { FilesModule } from "./modules/files/files.module";
import { pluginsModules } from "./plugins";
import { JobLogModule } from "./modules/job-log/job-log.module";
import { HealthModule } from "./modules/health/health.module";

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
    DossiersModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ConnectorModule,
    FilesModule,
    HealthModule,
    ...pluginsModules,

    // TODO: AppModule use JobModule for now to retrieve JobLogService
    JobLogModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
