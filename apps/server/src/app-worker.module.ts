import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

// Load Configurations
import configuration from "./config/worker-configuration";
import dsConfig from "./config/ds.config";
import { AppDataSource } from "./db/app-data-source";

// Load Modules
import { DemarchesModule } from "./demarches/demarches.module";
import { DemarchesDSModule } from "./demarches_ds/demarches_ds.module";
import { DossiersModule } from "./dossiers/dossiers.module";
import { DossiersDSModule } from "./dossiers_ds/dossiers_ds.module";
import { LoggerModule } from "./logger/logger.module";
import fileConfig from "./config/file.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      //TODO: what is in dsConfig are not config
      load: [configuration, dsConfig, fileConfig],
    }),
    LoggerModule,
    //TODO: worker should not have same config as server. It should not be able to access all entity of application
    TypeOrmModule.forRoot(AppDataSource.options),
    DemarchesModule,
    DemarchesDSModule,
    DossiersModule,
    DossiersDSModule,
  ],
  controllers: [],
  providers: [],
})
export class AppWorkerModule {}
