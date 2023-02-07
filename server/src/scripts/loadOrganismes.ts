import { NestFactory } from "@nestjs/core";
import { AppModule } from "app.module";
import { LoggerService } from "logger/logger.service";
import { OrganismesDatasService } from "plugins/organisme/organismes_datas/organismes_datas.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.useLogger(app.get(LoggerService));

  try {
    const serviceData = app.get(OrganismesDatasService);
    const idRNA = "13002526500013";
    if (!(await serviceData.findAndAddByIdRnaFromAllApi(idRNA))) {
      console.warn(`Pas Enregistrement pour ${idRNA}`);
    }
    await app.close();
  } catch (error) {
    console.error(error);
  }

  process.exit(0);
}
bootstrap();
