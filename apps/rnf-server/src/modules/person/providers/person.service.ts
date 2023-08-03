import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/shared/modules/prisma/providers/prisma.service";
import { BaseEntityService } from "@/shared/base-entity/base-entity.service";
import { PeopleEntity } from "@/modules/people/objects/people.entity";

@Injectable()
export class PeopleService extends BaseEntityService<PeopleEntity> {
  constructor(private prismaService: PrismaService) {
    super(prismaService);
  }
}
