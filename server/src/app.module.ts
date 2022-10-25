import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

// Load Modules
import { DemarchesModule } from "./demarches/demarches.module";
import { DemarchesDSModule } from "./demarches_ds/demarches_ds.module";
import { DossiersModule } from "./dossiers/dossiers.module";
import { DossiersDSModule } from "./dossiers_ds/dossiers_ds.module";

// Load Database Entities
import {
  DemarcheDSEntity,
  DemarcheEntity,
  DossierDSEntity,
  DossierEntity,
} from "./entities";

const host = process.env.POSTGRES_HOST || "localhost";
const port = Number(process.env.POSTGRES_PORT) || 5432;
const username = process.env.POSTGRES_USERNAME || "user";
const password = process.env.POSTGRES_PASSWORD || "password";
const database = process.env.POSTGRES_DB || "biblio-num";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host,
      port,
      username,
      password,
      database,
      entities: [
        DemarcheEntity,
        DemarcheDSEntity,
        DossierEntity,
        DossierDSEntity,
      ],
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
