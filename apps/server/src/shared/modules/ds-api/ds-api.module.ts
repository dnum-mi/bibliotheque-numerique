import { Global, Module } from '@nestjs/common'
import { DsApiClient } from '@dnum-mi/ds-api-client'
import { ConfigService } from '@nestjs/config'

@Global()
@Module({
  providers: [
    {
      provide: DsApiClient,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DsApiClient => {
        return new DsApiClient(
          configService.get('ds').apiUrl,
          configService.get('ds').apiToken,
          process.env.http_proxy || '',
        )
      },
    },
  ],
  exports: [DsApiClient],
})
export class DsApiModule {}
