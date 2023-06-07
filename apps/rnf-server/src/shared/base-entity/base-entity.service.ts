import { PrismaService } from "@/shared/modules/prisma/providers/prisma.service";

export abstract class BaseEntityService<T> {
  constructor(protected readonly prisma: PrismaService) {}
}
