import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "../../modules/logger/logger.module";
import { LoggerService } from "../../modules/logger/logger.service";
import { DataSource } from "typeorm";
import { DataSourceOptions } from "typeorm/data-source/DataSourceOptions";
import typeormNestConfig from "../../config/typeorm-nest.config";

export const typeormFactoryLoader = {
  imports: [
    ConfigModule.forRoot({
      cache: true,
      load: [typeormNestConfig],
    }),
    LoggerModule,
  ],
  inject: [ConfigService, LoggerService],
  useFactory: async (
    configService: ConfigService,
    logger: LoggerService,
  ): Promise<DataSourceOptions> => {
    const options = configService.get("database");

    const dataSource = new DataSource(options);
    await dataSource
      .initialize()
      .then(() => {
        if (!configService.get("isTest")) {
          logger.log(
            `Database connection with ${options.database} established`,
          );
        }
      })
      .catch((e) => {
        logger.error(`Database connection failed: ${e.message}`);
      });
    return dataSource.options;
  },
};
