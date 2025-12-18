import { Injectable } from '@nestjs/common'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { OnGlobalQueueError, OnQueueFailed, Processor } from '@nestjs/bull'
import type { Job } from 'bull'
import { LoggerService } from '@/shared/modules/logger/logger.service'

@Injectable()
@Processor(QueueName.file)
export class FileQueueEventService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name)
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error): void {
    this.logger.error(`FILE JOB FAILED: ${job.name} id=${job.id}`)
    // @ts-ignore if payload exist we want to print it
    this.logger.debug(job.payload)
    this.logger.error(err)
  }

  @OnGlobalQueueError()
  handlerQueueError(error: Error): void {
    this.logger.error('GLOBAL QUEUE ERROR')
    this.logger.error(error)
  }
}
