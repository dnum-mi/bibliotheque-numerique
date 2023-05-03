import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { DemarchesDSService } from "../demarches_ds/demarches_ds.service";
import { DossiersDSService } from "../dossiers_ds/dossiers_ds.service";
import { LoggerService } from "../logger/logger.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.useLogger(app.get(LoggerService));

  try {
    const demarchesDSService = app.get(DemarchesDSService);
    const dossierDSServices = app.get(DossiersDSService);
    const logger = app.get(LoggerService);

    const demarchesNumbers: number[] =
      await demarchesDSService.allDemarchesIds();

    logger.log(`Demarches Numbers to upsert: ${demarchesNumbers}`);
    await demarchesDSService.upsertDemarchesDSAndDemarches(demarchesNumbers);

    await Promise.all(
      demarchesNumbers.map(async (demarcheId) => {
        logger.log(`Demarche Number to upsert Dossier: ${demarcheId}`);
        await dossierDSServices.upsertDemarcheDossiersDS(demarcheId);
      }),
    );

    await app.close();
  } catch (error) {
    console.error(error);
  }

  process.exit(0);
}
bootstrap();
