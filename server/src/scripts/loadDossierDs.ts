import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { DossiersDSService } from "../dossiers_ds/dossiers_ds.service";

import * as dotenv from "dotenv";
import { LoggerService } from "../logger/logger.service";
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.useLogger(app.get(LoggerService));

  const dossierDSServices = app.get(DossiersDSService);

  try {
    await dossierDSServices.upsertDossierDS(1, 1);
    await dossierDSServices.upsertDemarcheDossiersDS(1);

    await app.close();
  } catch (error) {
    console.error(error);
  }

  process.exit(0);
}
bootstrap();
