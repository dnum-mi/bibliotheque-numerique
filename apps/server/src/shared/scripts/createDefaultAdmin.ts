import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../app.module";
import { LoggerService } from "../../modules/logger/logger.service";

import { UsersService } from "../../modules/users/users.service";
import { RolesService } from "../../modules/roles/providers/roles.service";
import { ConfigService } from "@nestjs/config";
import { TConfig } from "../../config/configuration";

// TODO: fixe type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.useLogger(app.get(LoggerService));

  const configService = app.get(ConfigService);
  const defaultAdmin =
    configService.get<TConfig["defaultAdmin"]>("defaultAdmin");

  const usersService = app.get(UsersService);
  const rolesService = app.get(RolesService);

  const { email, password, roleName } = defaultAdmin;

  try {
    const [user, role] = await Promise.all([
      usersService.findOrCreate(email, password),
      rolesService.create({
        name: roleName,
        description: "App administrator, has full rights",
      }),
    ]);
    if (user?.id && role?.id)
      await rolesService.assignRoleToUser(role.id, user.id);
    else throw new Error("Unable to create default admin");
    await app.close();
  } catch (error) {
    console.error(error);
  }

  process.exit(0);
}
bootstrap();
