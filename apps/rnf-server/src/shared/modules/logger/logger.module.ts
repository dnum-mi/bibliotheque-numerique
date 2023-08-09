import { Global, Module } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'

@Global()
@Module({
  imports: [],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
