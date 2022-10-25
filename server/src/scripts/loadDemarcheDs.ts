import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { DemarchesDSService } from "../demarches_ds/demarches_ds.service";
import { DemarchesService } from "../demarches/demarches.service";
async function bootstrap() {
  const application = await NestFactory.createApplicationContext(AppModule);

  const demarchesDSService = application.get(DemarchesDSService);
  const demarchesService = application.get(DemarchesService);
  // TODO:  demarchesNumbers array has to be dynamic
  const { raw } = await demarchesDSService.updateDemarchesDS([1, 2, 3, 4]);
  await demarchesService.updateDemarches(
    raw.map((r) => ({ ...r.dataJson, id: r.id })),
  );
  await application.close();
  process.exit(0);
}

bootstrap();
