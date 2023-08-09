import { Injectable } from '@nestjs/common'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { FoundationHistoryEntity } from '@/modules/foundation/objects/foundation-history.entity'
import { FoundationEntity } from '@/modules/foundation/objects/foundation.entity'
import { Prisma } from '@prisma/client'

@Injectable()
export class FoundationHistoryService extends BaseEntityService {
  constructor (protected readonly prisma: PrismaService, private logger: LoggerService) {
    super(prisma)
    this.logger.setContext(this.constructor.name)
  }

  // @ts-expect-error TODO: wip
  // eslint-disable-next-line @typescript-eslint/require-await
  async newHistoryEntry (fe: FoundationEntity, json: Prisma.JSON): Promise<FoundationHistoryEntity> {
    this.logger.verbose('newHistoryEntry')
  }
}
