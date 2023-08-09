import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'

@Injectable()
export class PersonService extends BaseEntityService {
  constructor (private prismaService: PrismaService) {
    super(prismaService)
  }
}
