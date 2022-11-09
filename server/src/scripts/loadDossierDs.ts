import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { DossiersDSService } from "../dossiers_ds/dossiers_ds.service";

import * as dotenv from "dotenv";
dotenv.config();

async function bootstrap() {
  const application = await NestFactory.createApplicationContext(AppModule, {
    logger: console,
  });

  const dossierDSServices = application.get(DossiersDSService);
  await dossierDSServices.upsertDossierDS(1, 1);
  await dossierDSServices.upsertDemarcheDossiersDS(1);

  await application.close();
  process.exit(0);
}

bootstrap();
