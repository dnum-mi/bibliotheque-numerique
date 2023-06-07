import { BaseEntityService } from "@/shared/base-entity/base-entity.service";
import { LoggerService } from "@/shared/modules/logger/providers/logger.service";
import { PrismaService } from "@/shared/modules/prisma/providers/prisma.service";
import { FoundationEntity } from "@/modules/foundation/objects/foundation.entity";
import { DsService } from "@/modules/ds/providers/ds.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateFoundationDto } from "@/modules/foundation/objects/dto/create-foundation.dto";
import { createRnfId } from "@/shared/utils/rnf-id.utils";
import { Foundation } from "@prisma/client";
import { GetFoundationOutputDto } from "@/modules/foundation/objects/dto/outputs/get-foundation-output.dto";

@Injectable()
export class FoundationService extends BaseEntityService<FoundationEntity> {
  constructor(protected readonly prisma: PrismaService, private readonly logger: LoggerService, private dsService: DsService) {
    super(prisma);
    this.logger.setContext(this.constructor.name);
  }

  async CreateFoundation(dto: CreateFoundationDto): Promise<Foundation> {
    this.logger.verbose(`CreateFoundation`);
    const code = dto.address.departmentCode;
    if (!dto.address || !code) {
      throw new BadRequestException("An address with its departmentCode is required.");
    }
    this.logger.debug(`department found: ${dto.address.departmentCode}`);
    return this.prisma.$transaction(async (prisma) => {
      const foundation = await prisma.foundation.create({
        data: {
          title: dto.title,
          type: dto.type,
          phone: dto.phone,
          email: dto.email,
          department: parseInt(code),
          address: {
            create: dto.address,
          },
          rnfId: `in-creation-${new Date().getTime()}`,
        },
      });
      this.logger.debug(`foundation created: ${foundation.id}`);
      foundation.rnfId = createRnfId(foundation);
      await prisma.foundation.update({ where: { id: foundation.id }, data: { rnfId: createRnfId(foundation) } });
      return foundation;
    });
  }

  async getFoundation(rnfId: string): Promise<GetFoundationOutputDto> {
    this.logger.verbose(`getFoundation`);
    return this.prisma.foundation.findUnique({ where: { rnfId }, include: { address: true } }).then((foundation) => {
      if (!foundation) {
        throw new NotFoundException("No foundation found with this rnfId.");
      }
      return foundation;
    });
  }
}
