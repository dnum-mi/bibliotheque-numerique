import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { DemarchesDSService } from "../demarches_ds/demarches_ds.service";
import { DemarchesService } from "../demarches/demarches.service";
import { DossiersDSService } from "../dossiers_ds/dossiers_ds.service";

import * as dotenv from "dotenv";
dotenv.config();

async function bootstrap() {
  const application = await NestFactory.createApplicationContext(AppModule, {
    logger: console,
  });

  const demarchesDSService = application.get(DemarchesDSService);
  const demarchesService = application.get(DemarchesService);
  // TODO:  demarchesNumbers array has to be dynamic
  const demarchesNumbers: number[] = [1, 2, 3, 4, 11];
  const { raw } = await demarchesDSService.updateDemarchesDS(demarchesNumbers);
  await demarchesService.updateDemarches(
    raw.map((r) => ({ ...r.dataJson, id: r.id })),
  );
  const dossierDSServices = application.get(DossiersDSService);
  await Promise.all(
    demarchesNumbers.map(async (demarcheId) => {
      await dossierDSServices.upsertDemarcheDossiersDS(demarcheId);
    }),
  );
  await application.close();
  process.exit(0);
}

bootstrap();
