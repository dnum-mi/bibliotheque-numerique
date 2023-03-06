import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "app.module";
import { LoggerService } from "logger/logger.service";
import { OrganismesDatasService } from "plugins/organisme/organismes_datas/organismes_datas.service";

async function bootstrap() {
  let app;
  try {
    app = await NestFactory.createApplicationContext(AppModule);
    app.useLogger(app.get(LoggerService));

    const serviceData = app.get(OrganismesDatasService);
    const idRNAs = ["13002526500013", "W751212517"];

    for (const idRNA of idRNAs) {
      if (!(await serviceData.findAndAddByIdRnaFromAllApi(idRNA))) {
        console.warn(`Pas Enregistrement pour ${idRNA}`);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    if (app) {
      await app.close();
    }
  }

  process.exit(0);
}
bootstrap();
