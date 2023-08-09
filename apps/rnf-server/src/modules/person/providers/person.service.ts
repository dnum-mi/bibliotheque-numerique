import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { PersonEntity } from '@/modules/person/objects/person.entity'

@Injectable()
export class PersonService extends BaseEntityService<PersonEntity> {
  constructor (private prismaService: PrismaService) {
    super(prismaService)
  }
}
