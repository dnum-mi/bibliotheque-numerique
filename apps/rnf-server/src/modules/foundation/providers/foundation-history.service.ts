import { Injectable } from '@nestjs/common'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { FoundationHistoryEntity } from '@/modules/foundation/objects/foundation-history.entity'
import { FoundationEntity } from '@/modules/foundation/objects/foundation.entity'

@Injectable()
export class FoundationHistoryService extends BaseEntityService {
  constructor(
    protected readonly prisma: PrismaService,
    private logger: LoggerService,
  ) {
    super(prisma)
    this.logger.setContext(this.constructor.name)
  }

  async howManyVersion(rnfId: string): Promise<number> {
    this.logger.verbose('howManyVersion')
    return this.prisma.foundationHistory.count({ where: { rnfId } })
  }

  async newHistoryEntry(
    fe: FoundationEntity,
  ): Promise<FoundationHistoryEntity> {
    this.logger.verbose('newHistoryEntry')
    return this.prisma.foundationHistory.create({
      data: {
        title: fe.title,
        type: fe.type,
        department: fe.department,
        email: fe.email,
        phone: fe.phone,
        dissolvedAt: fe.dissolvedAt,
        rnfId: fe.rnfId,
        address: JSON.stringify(fe.address),
        persons: JSON.stringify(fe.persons),
        status: JSON.stringify(fe.status),
        historyNumber: await this.howManyVersion(fe.rnfId),
      },
    })
  }
}
