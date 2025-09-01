import { Global, Module } from '@nestjs/common'
import { AsyncLocalStorage } from 'async_hooks'

export const ALS_INSTANCE = 'ALS_INSTANCE'

@Global()
@Module({
  providers: [
    {
      provide: ALS_INSTANCE,
      useValue: new AsyncLocalStorage(),
    },
  ],
  exports: [ALS_INSTANCE],
})
export class AlsModule {}
