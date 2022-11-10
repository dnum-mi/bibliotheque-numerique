import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

// Load Configurations
import configuration from "./config/configuration";

// Load Modules
import { DemarchesModule } from "./demarches/demarches.module";
import { DemarchesDSModule } from "./demarches_ds/demarches_ds.module";
import { DossiersModule } from "./dossiers/dossiers.module";
import { DossiersDSModule } from "./dossiers_ds/dossiers_ds.module";

// Load Database Entities
import { DemarcheDS, Demarche, DossierDS, Dossier } from "./entities";
import { LoggerModule } from "./logger/logger.module";

const host = process.env.POSTGRES_HOST || "localhost";
const port = Number(process.env.POSTGRES_PORT) || 5432;
const username = process.env.POSTGRES_USERNAME || "user";
const password = process.env.POSTGRES_PASSWORD || "password";
const database = process.env.POSTGRES_DB || "biblio-num";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),
    LoggerModule,
    TypeOrmModule.forRoot({
      type: "postgres",
      host,
      port,
      username,
      password,
      database,
      entities: [Demarche, DemarcheDS, Dossier, DossierDS],
      synchronize: true,
    }),
    DemarchesModule,
    DemarchesDSModule,
    DossiersModule,
    DossiersDSModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
