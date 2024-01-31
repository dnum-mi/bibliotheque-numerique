import { ConfigModule, ConfigService } from '@nestjs/config'
import { SharedBullAsyncConfiguration } from '@nestjs/bull'

const bullModuleFactoryLoader = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    redis: {
      host: configService.get('redis.host'),
      password: configService.get('redis.password'),
      port: configService.get('redis.port'),
    },
  }),
  inject: [ConfigService],
} as SharedBullAsyncConfiguration

export default bullModuleFactoryLoader
