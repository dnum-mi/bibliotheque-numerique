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

  // TODO:  demarchesNumbers array has to be dynamic
  const demarchesNumbers: number[] = [1, 2, 3, 4, 8, 11];

  try {
    const demarchesDSService = app.get(DemarchesDSService);
    const dossierDSServices = app.get(DossiersDSService);

    await demarchesDSService.upsertDemarchesDSAndDemarches(demarchesNumbers);

    await Promise.all(
      demarchesNumbers.map(async (demarcheId) => {
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
