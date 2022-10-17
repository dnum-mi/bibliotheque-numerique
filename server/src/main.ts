import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(3000);
}
bootstrap();
