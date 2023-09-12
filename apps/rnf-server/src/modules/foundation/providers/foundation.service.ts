import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'
import { FoundationEntity } from '@/modules/foundation/objects/foundation.entity'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateFoundationDto } from '@/modules/foundation/objects/dto/create-foundation.dto'
import { createRnfId } from '@/shared/utils/rnf-id.utils'
import { Foundation } from '@prisma/client'
import { GetFoundationOutputDto } from '@/modules/foundation/objects/dto/outputs/get-foundation-output.dto'
import { formatPhoneNumber } from '@/shared/utils/number.utils'
import { CollisionException } from '@/shared/exceptions/collision.exception'
import { ConfigService } from '@nestjs/config'
import { InfoDSOutputDto } from '../objects/dto/info-ds-output.dto'
import { FileStorageService } from '@/modules/file-storage/providers/file-storage.service'

@Injectable()
export class FoundationService extends BaseEntityService {
  constructor (
    protected readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly fileStorage: FileStorageService,
  ) {
    super(prisma)
    this.logger.setContext(this.constructor.name)
  }

  private async _findIdOfCollision (dto: CreateFoundationDto): Promise<{ id: number }[]> {
    // we cannot use prisma natively here because of the similarity function
    return this.prisma.$queryRaw`
      SELECT "Foundation".id, "Address".label
      FROM "Foundation"
      LEFT JOIN "Address" ON "Foundation"."addressId" = "Address".id
      WHERE
        "Foundation"."type"::text = ${dto.type} AND
        (
            "Foundation"."email" = ${dto.email} OR
            "Foundation"."phone" = ${dto.phone} OR
            "Address"."label" = ${dto.address.label} OR
            similarity(
                lower(unaccent(replace("Foundation"."title", ' ', ''))),
                lower(unaccent(replace(${dto.title}, ' ', '')))
            ) > ${this.config.get('foundationTitleSimilarityThreshold')}
        );
    ` as Promise<{ id: number }[]>
  }

  private async _findCollision (dto: CreateFoundationDto, ds: InfoDSOutputDto): Promise<void> {
    const collisions = await this._findIdOfCollision(dto)
    if (collisions.length) {
      throw new CollisionException(dto, await this.getFoundations(collisions.map((id) => id.id)), ds)
    }
  }

  async CreateFoundation (dto: CreateFoundationDto, ds: InfoDSOutputDto, forceCreation?: boolean): Promise<Foundation> {
    this.logger.verbose('CreateFoundation')
    const code = dto.address.departmentCode
    if (!dto.address || !code) {
      throw new BadRequestException('An address with its departmentCode is required.')
    }
    this.logger.debug(`department found: ${dto.address.departmentCode}`)
    dto.phone = formatPhoneNumber(dto.phone)
    if (!forceCreation) {
      await this._findCollision(dto, ds)
    }

    return this.prisma.$transaction(async (prisma) => {
      const statusFile = dto.status
      let file: Awaited<ReturnType<FileStorageService['copyRemoteFile']>> | undefined
      if (statusFile) {
        file = await this.fileStorage.copyRemoteFile(statusFile)
      }

      const foundation = await prisma.foundation.create({
        data: {
          title: dto.title,
          type: dto.type,
          phone: dto.phone,
          email: dto.email,
          department: code,
          address: {
            create: dto.address,
          },
          rnfId: `in-creation-${new Date().getTime()}`,
          ...((file && statusFile)
            ? {
                status: {
                  create: {
                    ...{ ...statusFile, fileUrl: undefined },
                    name: file.key,
                    path: file.location,
                  },
                },
              }
            : {}),
        },
      })
      this.logger.debug(`foundation created: ${foundation.id}`)
      const index = await prisma.foundation.count({ where: { type: dto.type, department: code } })
      const rnfId = createRnfId({ foundation, index })
      await prisma.foundation.update({ where: { id: foundation.id }, data: { rnfId } })
      foundation.rnfId = rnfId
      return foundation
    })
  }

  async getFoundations (ids: number[]): Promise<FoundationEntity[]> {
    return this.prisma.foundation.findMany({
      where: { id: { in: ids } },
      include: { address: true },
    })
  }

  async getOneFoundation (rnfId: string): Promise<GetFoundationOutputDto> {
    this.logger.verbose('getOneFoundation')
    return this.prisma.foundation.findUnique({ where: { rnfId }, include: { address: true } }).then((foundation) => {
      if (!foundation) {
        throw new NotFoundException('No foundation found with this rnfId.')
      }
      return foundation
    })
  }

  async getFoundationsByRnfIds (rnfIds: string[], updatedAfter: Date | undefined): Promise<FoundationEntity[]> {
    const where: {
      rnfId: { in: string[] };
      updatedAt?: { gte: Date };
    } = { rnfId: { in: rnfIds } }
    if (updatedAfter) {
      where.updatedAt = {
        gte: updatedAfter,
      }
    }
    return this.prisma.foundation.findMany({
      where,
      include: { address: true },
    })
  }
}
