import { ConfigModule, ConfigModuleOptions, ConfigService } from '@nestjs/config'
import { LoggerService } from '../modules/logger/logger.service'
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions'
import typeormNestConfig from '../../config/typeorm-nest.config'
import configuration from '../../config/configuration'
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'

export const typeormFactoryLoader: TypeOrmModuleAsyncOptions = {
  imports: [
    ConfigModule.forRoot({
      cache: true,
      load: [configuration, typeormNestConfig],
    } as ConfigModuleOptions),
  ],
  inject: [ConfigService, LoggerService],
  useFactory: async (configService: ConfigService): Promise<DataSourceOptions> => {
    return configService.get('database')
  },
}
