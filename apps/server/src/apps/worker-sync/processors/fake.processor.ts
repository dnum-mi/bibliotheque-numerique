import { InjectQueue, Processor } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.const'
import { OnApplicationBootstrap } from '@nestjs/common'
import { Queue } from 'bull'

@Processor(QueueName.sync)
export class FakeProcessor implements OnApplicationBootstrap {
  constructor(@InjectQueue(QueueName.sync) private readonly syncQueue: Queue) {}

  async onApplicationBootstrap(): Promise<void> {
    console.log('inserting a fake job in the queue to POC')
    const job = await this.syncQueue.add('Fake job', {
      toto: 42,
    })
    console.log(job)
  }
}
