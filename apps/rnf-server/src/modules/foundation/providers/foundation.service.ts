import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'
import { FoundationEntity } from '@/modules/foundation/objects/foundation.entity'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateFoundationDto } from '@/modules/foundation/objects/dto/create-foundation.dto'
import { createRnfId } from '@/shared/utils/rnf-id.utils'
import { formatPhoneNumber } from '@/shared/utils/number.utils'
import { CollisionException } from '@/shared/exceptions/collision.exception'
import { ConfigService } from '@nestjs/config'
import { InfoDSOutputDto } from '../objects/dto/info-ds-output.dto'
import { UpdateFoundationDto } from '@/modules/foundation/objects/dto/update-foundation.dto'
import { FoundationHistoryService } from '@/modules/foundation/providers/foundation-history.service'
import { DossierState, DossierWithCustomChamp } from '@dnum-mi/ds-api-client'
import { stringValue } from '@/modules/ds/objects/mappers/universal.mapper'
import { IDsApiClientDemarche, DsService } from '@/modules/ds/providers/ds.service'
import { DsConfigurationService } from '@/modules/ds/providers/ds-configuration.service'
import { DsMapperService } from '@/modules/ds/providers/ds-mapper.service'
import { FileStorageService } from '@/modules/file-storage/providers/file-storage.service'
import { CreateFileStorageDto } from '@/shared/objects/file-storage/create-file.dto'
import { Prisma } from '@prisma/client'

interface createNestedStatus {
  status: Prisma.FileStorageCreateNestedOneWithoutFoundationInput
}
interface updateNestedStatus {
  status: Prisma.FileStorageUpdateOneWithoutFoundationNestedInput
}
@Injectable()
export class FoundationService extends BaseEntityService {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly fileStorage: FileStorageService,
    private readonly dsService: DsService,
    private readonly dsMapperService: DsMapperService,
    private readonly dsConfigurationService: DsConfigurationService,
    private readonly historyService: FoundationHistoryService,
  ) {
    super(prisma)
    this.logger.setContext(this.constructor.name)
  }

  /* region Create Foundation */
  private async _findIdOfCollision(
    dto: CreateFoundationDto,
  ): Promise<{ id: number }[]> {
    this.logger.verbose('_findIdOfCollision')
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

  private async _findCollision(
    dto: CreateFoundationDto,
    ds: InfoDSOutputDto,
  ): Promise<void> {
    this.logger.verbose('_findCollision')
    const collisions = await this._findIdOfCollision(dto)
    if (collisions.length) {
      throw new CollisionException(
        dto,
        await this.getFoundations(collisions.map((id) => id.id)),
        ds,
      )
    }
  }

  private async _cascadeCreateFile(
    statusFile: CreateFileStorageDto | undefined,
  ): Promise<null | createNestedStatus> {
    this.logger.verbose('_cascadeCreateFile')
    if (statusFile) {
      const file = await this.fileStorage.copyRemoteFile(statusFile)
      return {
        status: {
          create: {
            ...{ ...statusFile, fileUrl: undefined },
            name: file.key,
            path: file.location,
          },
        },
      }
    }
    return null
  }

  async createFoundation(
    dto: CreateFoundationDto,
    ds: InfoDSOutputDto,
    forceCreation?: boolean,
  ): Promise<FoundationEntity> {
    this.logger.verbose('CreateFoundation')
    const code = dto.address.departmentCode
    if (!dto.address || !code) {
      throw new BadRequestException(
        'An address with its departmentCode is required.',
      )
    }
    this.logger.debug(`department found: ${dto.address.departmentCode}`)
    dto.phone = formatPhoneNumber(dto.phone)
    if (!forceCreation) {
      await this._findCollision(dto, ds)
    }

    return this.prisma.$transaction(async (prisma) => {
      this.logger.debug('Starting transaction')
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
          ...((await this._cascadeCreateFile(dto.status)) ?? {}),
          ...this._cascadeCreatePersons(dto),
        },
      })

      const index = await prisma.foundation.count({
        where: { type: dto.type, department: code },
      })
      const rnfId = createRnfId({ foundation, index })
      await prisma.foundation.update({
        where: { id: foundation.id },
        data: { rnfId },
      })
      foundation.rnfId = rnfId
      this.logger.log(`A new Foundation has been created: ${foundation.rnfId}`)
      return foundation
    })
  }

  private _cascadeCreatePersons(dto: CreateFoundationDto): Prisma.FoundationCreateNestedOneWithoutPersonsInput {
    this.logger.verbose('_cascadeCreatePersons')
    let persons = {}
    if (dto.personInFoundationToCreate) {
      persons = {
        persons: {
          create: dto.personInFoundationToCreate.map((personInFoundation) => ({
            person: {
              create: {
                lastName: personInFoundation.person.lastName,
                firstName: personInFoundation.person.firstName,
                bornAt: personInFoundation.person.bornAt,
                bornPlace: personInFoundation.person.bornPlace,
                nationality: personInFoundation.person.nationality,
                profession: personInFoundation.person.profession,
                phone: personInFoundation.person.phone,
                email: '',
                address: {
                  create: personInFoundation.person.address,
                },
              },
            },
            roles: personInFoundation.role,
          })),
        },
      }
    }
    return persons
  }

  /* endregion */

  /* region Get foundations */
  async getFoundations(ids: number[]): Promise<FoundationEntity[]> {
    this.logger.verbose('getFoundations')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this.prisma.foundation.findMany({
      where: { id: { in: ids } },
      include: {
        address: true,
        status: true,
        persons: {
          include: {
            person: true,
          },
        },
      },
    })
  }

  async getOneFoundation(rnfId: string): Promise<FoundationEntity> {
    this.logger.verbose('getOneFoundation')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this.prisma.foundation
      .findFirst({
        where: { rnfId },
        include: {
          address: true,
          status: true,
          persons: {
            include: {
              person: true,
            },
          },
        },
      })
      .then((f) => {
        if (!f) {
          throw new NotFoundException(
            `Foundation with rnfId ${rnfId} not found`,
          )
        }
        return f
      })
  }

  async getFoundationsByRnfIds(
    rnfIds: string[],
    updatedAfter: Date | undefined,
  ): Promise<FoundationEntity[]> {
    this.logger.verbose('getFoundationsByRnfIds')
    const where: {
      rnfId: { in: string[] }
      updatedAt?: { gte: Date }
    } = { rnfId: { in: rnfIds } }
    if (updatedAfter) {
      where.updatedAt = {
        gte: updatedAfter,
      }
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this.prisma.foundation.findMany({
      where,
      include: {
        address: true,
        status: true,
        persons: {
          include: {
            person: true,
          },
        },
      },
    })
  }

  /* endregion */

  /* region update foundation */
  public async triggerAllRefresh() {
    this.logger.log('Refreshing foundation')
    await this.triggerFeModificationRefresh()
    await this.triggerFddModificationRefresh()
    await this.triggerFeDissolution()
    await this.triggerFddDissolution()
    this.logger.log('Setting lastRefreshedAt')
    await this.dsConfigurationService.updateConfiguration({
      foundationRefreshedAt: new Date(),
    })
  }

  public async triggerFeModificationRefresh() {
    this.logger.verbose('triggerFeModificationRefresh')
    await this._lookForFoundationModification(
      'Modification of FE',
      this.dsConfigurationService.configuration.dsDemarcheFEModificationId,
    )
  }

  public async triggerFddModificationRefresh() {
    this.logger.verbose('triggerFddModificationRefresh')
    await this._lookForFoundationModification(
      'Modification of FDD',
      this.dsConfigurationService.configuration.dsDemarcheFDDModificationId,
    )
  }

  public async triggerFeDissolution() {
    await this._lookForFoundationDissolution(
      'Dissolution of FE',
      this.dsConfigurationService.configuration.dsDemarcheFEDissolutionId,
    )
  }

  public async triggerFddDissolution() {
    await this._lookForFoundationDissolution(
      'Dissolution of FDD',
      this.dsConfigurationService.configuration.dsDemarcheFDDDissolutionId,
    )
  }

  async updateFoundation(rnfId: string, dto: UpdateFoundationDto) {
    this.logger.verbose('updateFoundation')
    const foundation = await this.getOneFoundation(rnfId)
    await this.historyService.newHistoryEntry(foundation)
    const cascadeFile = await this._cascadeCreateFile(dto.status)
    const cascadeUpdateFile: updateNestedStatus | undefined = cascadeFile
      ? {
        status: {
          create: cascadeFile.status.create,
          // disconnect: true,
        },
      }
      : undefined

    // TODO: update persons
    delete dto.personInFoundationToCreate

    return this.prisma.foundation.update({
      where: { rnfId },
      // @ts-expect-error why ?
      data: {
        ...dto,
        address: {
          update: dto.address,
        },
        ...cascadeUpdateFile,
      },
    })
  }

  private async _lookForFoundationModification(
    name: string,
    dsDemarcheId: number,
  ): Promise<void> {
    this.logger.verbose('_lookForFoundationModification')
    this.logger.log(`Checking for: ${name}`)
    let raw: IDsApiClientDemarche
    try {
      raw = await this.dsService.getOneDemarcheWithDossier(
        dsDemarcheId,
        this.dsConfigurationService.configuration.foundationRefreshedAt,
      )
    } catch (e) {
      this.logger.error(`Error while fetching ${name}`)
      this.logger.error(e as Error)
      return
    }
    const dossiers = raw.demarche.dossiers.nodes
    if (dossiers.length) {
      for (const doss of dossiers) {
        try {
          await this._updateOneFoundationWithDossier(doss, dsDemarcheId)
        } catch (err) {
          this.logger.error(`Error for dossier: ${doss.number}`)
          this.logger.error(err as Error)
        }
      }
    } else {
      this.logger.debug('No dossier to update.')
    }
  }

  private checkIfRnfInAcceptedDossier(doss: DossierWithCustomChamp): string | null {
    const rnfChamp = this.dsMapperService.findChampsInDossier(doss.champs, {
      rnf: this.dsConfigurationService.rnfFieldKeys.rnfId,
    }).rnf
    let rnfId: string | null = stringValue(rnfChamp)
    if (!rnfId) {
      this.logger.debug(`No RNF-ID in dossier (nbrDossier: ${doss.number})`)
    } else if (doss.state !== DossierState.Accepte) {
      this.logger.debug(
        `Dossier (nbrDossier: ${doss.number}) is not accepted. (${doss.state})`,
      )
      rnfId = null
    }
    return rnfId
  }

  private async _updateOneFoundationWithDossier(
    doss: DossierWithCustomChamp,
    dsDemarcheId: number,
  ): Promise<void> {
    this.logger.verbose('_synchroniseOneDossier')
    const rnfId = this.checkIfRnfInAcceptedDossier(doss)
    if (rnfId) {
      this.logger.verbose(
        `Updating foundation ${rnfId} with dossier ${doss.number}`,
      )
      const dto = this.dsMapperService.mapDossierToDto(
        doss,
        this.dsConfigurationService.getMapperFromDemarcheDsId(dsDemarcheId),
      )
      await this.updateFoundation(rnfId, dto)
    }
  }

  private async _lookForFoundationDissolution(name: string, dsDemarcheId: number) {
    this.logger.verbose('_lookForFoundationDissolution')
    this.logger.log(`Checking for: ${name}`)
    let raw: IDsApiClientDemarche
    try {
      raw = await this.dsService.getOneDemarcheWithDossier(
        dsDemarcheId,
        this.dsConfigurationService.configuration.foundationRefreshedAt,
      )
    } catch (e) {
      this.logger.error(`Error while fetching ${name}`)
      this.logger.error(e as Error)
      return
    }
    const dossiers = raw.demarche.dossiers.nodes
    if (dossiers.length) {
      for (const doss of dossiers) {
        const rnfId = this.checkIfRnfInAcceptedDossier(doss)
        if (rnfId) {
          this.logger.log(
            `Dissolving foundation ${rnfId} because of dossier ${doss.number}`,
          )
          try {
            await this.updateFoundation(rnfId, {
              dissolvedAt: new Date(),
            })
          } catch (e) {
            this.logger.error(`Error while updating foundation ${rnfId}`)
            this.logger.error(e as Error)
          }
        }
      }
    } else {
      this.logger.debug('No dossier to update.')
    }
  }

  /* endregion */
}
