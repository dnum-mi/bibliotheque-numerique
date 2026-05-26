import { Global, Module } from '@nestjs/common'
import { LoggerService } from './logger.service'
import { AlsModule } from '@/shared/modules/als/als.module'
import { ContextLoggerService } from '@/shared/modules/logger/context-logger.service'

@Global()
@Module({
  imports: [
    AlsModule,
  ],
  providers: [
    ContextLoggerService,
    LoggerService,
    ContextLoggerService,
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
