import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { DemarchesDSService } from "../demarches_ds/demarches_ds.service";
import { DemarchesService } from "../demarches/demarches.service";
import { DossiersDSService } from "../dossiers_ds/dossiers_ds.service";
import { LoggerService } from "../logger/logger.service";

import * as dotenv from "dotenv";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.useLogger(app.get(LoggerService));

  const demarchesDSService = app.get(DemarchesDSService);
  const demarchesService = app.get(DemarchesService);
  // TODO:  demarchesNumbers array has to be dynamic
  const demarchesNumbers: number[] = [1, 2, 3, 4, 11];

  try {
    const { raw } = await demarchesDSService.updateDemarchesDS(
      demarchesNumbers,
    );
    await demarchesService.updateDemarches(
      raw.map((r) => ({ ...r.dataJson, id: r.id })),
    );
    const dossierDSServices = app.get(DossiersDSService);
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
