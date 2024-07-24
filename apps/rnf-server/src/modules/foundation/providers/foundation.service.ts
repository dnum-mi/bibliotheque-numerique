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
import {
  IDsApiClientDemarche,
  DsService,
} from '@/modules/ds/providers/ds.service'
import { DsConfigurationService } from '@/modules/ds/providers/ds-configuration.service'
import { DsMapperService } from '@/modules/ds/providers/ds-mapper.service'
import { FileStorageService } from '@/modules/file-storage/providers/file-storage.service'
import { CreateFileStorageDto } from '@/shared/objects/file-storage/create-file.dto'
import { FoundationType, Prisma } from '@prisma/client'
import { FoundationOutputDto } from '@/modules/foundation/objects/dto/outputs/foundation-output.dto'

interface createNestedStatus {
  status: Prisma.FileStorageCreateNestedOneWithoutFoundationInput
}

interface updateNestedStatus {
  status: Prisma.FileStorageUpdateOneWithoutFoundationNestedInput
}

export const FoundationChangeType = {
  Modification: 'modification',
  Dissolution: 'dissolution',
  Administration: 'administration',
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

  //#region Create Foundation
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
    const code = dto.department
    if (!code) {
      throw new BadRequestException(
        'Department is required.',
      )
    }
    if (!dto.originalCreatedAt) {
      throw new BadRequestException(
        `${dto.type === FoundationType.FRUP ? 'FRUP: ' : ''}orginal created date is requied`,

      )
    }

    this.logger.debug(`department found: ${dto.department}`)
    dto.phone = formatPhoneNumber(dto.phone)
    if (!forceCreation) {
      await this._findCollision(dto, ds)
    }

    return this.prisma.$transaction(async (prisma) => {
      this.logger.debug('Starting transaction')
      const data: Prisma.FoundationCreateInput = {
        title: dto.title,
        type: dto.type,
        phone: dto.phone,
        email: dto.email,
        declarationYears: dto.declarationYears,
        department: code,
        address: {
          create: dto.address,
        },
        rnfId: `in-creation-${new Date().getTime()}`,
        ...((await this._cascadeCreateFile(dto.status)) ?? {}),
        ...this._cascadeCreatePersons(dto),
        fiscalEndDateAt: dto.fiscalEndDateAt,
      }
      if (dto.originalCreatedAt) {
        data.originalCreatedAt = dto.originalCreatedAt
      }
      const foundation = await prisma.foundation.create({
        data,
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

  private _cascadeCreatePersons(
    dto: CreateFoundationDto,
  ): Prisma.FoundationCreateNestedOneWithoutPersonsInput {
    this.logger.verbose('_cascadeCreatePersons')
    let persons = {}
    if (dto.personInFoundationToCreate) {
      persons = {
        persons: {
          create: dto.personInFoundationToCreate.map((personInFoundation) => ({
            person: {
              create: {
                lastName: personInFoundation.person.lastName || '',
                firstName: personInFoundation.person.firstName || '',
                bornAt: personInFoundation.person.bornAt ?? null,
                bornPlace: personInFoundation.person.bornPlace || '',
                nationality: personInFoundation.person.nationality || '',
                profession: personInFoundation.person.profession || '',
                phone: personInFoundation.person.phone || '',
                isFounder: personInFoundation.person.isFounder || false,
                email: personInFoundation.person.email || '',
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

  //#endregion

  //#region Get foundations
  private _cascadeGetFoundation(): Prisma.FoundationInclude {
    this.logger.verbose('_cascadeGetFoundation')
    return {
      address: true,
      status: true,
      persons: {
        include: {
          person: {
            include: {
              address: true,
            },
          },
        },
      },
    }
  }

  async getFoundations(ids: number[]): Promise<FoundationOutputDto[]> {
    this.logger.verbose('getFoundations')
    return this.prisma.foundation.findMany({
      where: { id: { in: ids } },
      include: {
        ...this._cascadeGetFoundation(),
      },
    })
  }

  async getOneFoundation(rnfId: string): Promise<FoundationOutputDto> {
    this.logger.verbose('getOneFoundation')
    return this.prisma.foundation
      .findFirst({
        where: { rnfId },
        include: {
          ...this._cascadeGetFoundation(),
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

  async getLastUpdatedFoundations(
    rnfIds: string[],
    updatedAfter: string | undefined,
  ): Promise<string[]> {
    this.logger.verbose('getFoundationsByRnfIds')
    // TODO: Why can't I use FoundationWhereInput
    // TODO:mconst where: FoundationWhereInput = { rnfId: { in: rnfIds } }
    const where: { rnfId: { in: string[] }; updatedAt?: { gte: Date } } = {
      rnfId: { in: rnfIds },
    }
    if (updatedAfter) {
      where.updatedAt = {
        gte: new Date(updatedAfter),
      }
    }
    return this.prisma.foundation
      .findMany({
        where,
        select: { rnfId: true },
      })
      .then((foundations) => foundations.map((f) => f.rnfId))
  }

  //#endregion

  private async handleCronJob(triggerFunction, jobName: string) {
    try {
      await triggerFunction()
    } catch (e) {
      this.logger.error(`Error during cron job ${jobName}`)
      this.logger.error(e as Error)
      console.log(e)
    }
  }

  //#region update foundation
  public async triggerAllRefresh() {
    this.logger.log(`Refreshing foundation at ${this.dsConfigurationService.configuration.foundationRefreshedAt}`)
    await this.handleCronJob(this.triggerFeModificationRefresh.bind(this), 'FE-Modification')
    await this.handleCronJob(this.triggerFddModificationRefresh.bind(this), 'FDD-Modification')
    await this.handleCronJob(this.triggerFeDissolution.bind(this), 'FE-Dissolution')
    await this.handleCronJob(this.triggerFddDissolution.bind(this), 'FDD-Dissolution')
    await this.handleCronJob(this.triggerFeAdministrationChanges.bind(this), 'FE-Administration')
    await this.handleCronJob(this.triggerFddAdministrationChanges.bind(this), 'FDD-Administration')

    this.logger.log('Setting lastRefreshedAt')
    await this.dsConfigurationService.updateConfiguration({
      foundationRefreshedAt: new Date(),
    })
  }

  // Function to execute the cron job
  //#region trigger
  public async triggerFeModificationRefresh(): Promise<void> {
    this.logger.verbose('triggerFeModificationRefresh')
    await this._lookForFoundationChange(
      'Modification of FE',
      this.dsConfigurationService.configuration.dsDemarcheFEModificationId,
      FoundationChangeType.Modification,
    )
  }

  public async triggerFddModificationRefresh(): Promise<void> {
    this.logger.verbose('triggerFddModificationRefresh')
    await this._lookForFoundationChange(
      'Modification of FDD',
      this.dsConfigurationService.configuration.dsDemarcheFDDModificationId,
      FoundationChangeType.Modification,
    )
  }

  public async triggerFeDissolution(): Promise<void> {
    await this._lookForFoundationChange(
      'Dissolution of FE',
      this.dsConfigurationService.configuration.dsDemarcheFEDissolutionId,
      FoundationChangeType.Dissolution,
    )
  }

  public async triggerFddDissolution(): Promise<void> {
    await this._lookForFoundationChange(
      'Dissolution of FDD',
      this.dsConfigurationService.configuration.dsDemarcheFDDDissolutionId,
      FoundationChangeType.Dissolution,
    )
  }

  public async triggerFeAdministrationChanges(): Promise<void> {
    await this._lookForFoundationChange(
      'Administration changes of FE',
      this.dsConfigurationService.configuration.dsDemarcheFEAdministrationChangesId,
      FoundationChangeType.Administration,
    )
  }

  public async triggerFddAdministrationChanges(): Promise<void> {
    await this._lookForFoundationChange(
      'Administration changes of FDD',
      this.dsConfigurationService.configuration.dsDemarcheFDDAdministrationChangesId,
      FoundationChangeType.Administration,
    )
  }

  public async triggerFrupModificationRefresh(): Promise<void> {
    this.logger.verbose('triggerFddModificationRefresh')
    await this._lookForFoundationChange(
      'Modification of FRUP',
      this.dsConfigurationService.configuration.dsDemarcheFRUPModificationId,
      FoundationChangeType.Modification,
    )
  }

  public async triggerFrupDissolution(): Promise<void> {
    await this._lookForFoundationChange(
      'Dissolution of FRUP',
      this.dsConfigurationService.configuration.dsDemarcheFRUPDissolutionId,
      FoundationChangeType.Dissolution,
    )
  }

  //#endregion trigger

  async updateFoundation(rnfId: string, dto: UpdateFoundationDto) {
    this.logger.verbose('updateFoundation')

    const foundation = (await this.getOneFoundation(rnfId)) as FoundationEntity
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

    return this.prisma.$transaction(async (prisma) => {
      let cascadeUpdatePersons = {}
      if (dto.personInFoundationToCreate && dto.personInFoundationToCreate.length > 0) {
        this.logger.debug('The personInFoundation not empty')
        cascadeUpdatePersons = this._cascadeCreatePersons(dto as CreateFoundationDto)
        await prisma.personInFoundation.deleteMany({
          where: { foundationId: foundation.id },
        })
      }

      delete dto.personInFoundationToCreate
      return prisma.foundation.update({
        where: { rnfId },
        // @ts-expect-error why ?
        data: {
          ...dto,
          address: {
            update: dto.address,
          },
          ...cascadeUpdatePersons,
          ...cascadeUpdateFile,
        },
      })
    })
  }

  private checkIfRnfInAcceptedDossier(
    doss: DossierWithCustomChamp,
  ): string | null {
    const rnfChamp = this.dsMapperService.findChampsInDossier(doss.champs, {
      rnf: this.dsConfigurationService.rnfFieldKeys.rnfId,
    }).rnf
    let rnfId: string | null = stringValue(rnfChamp)
    if (!rnfId) {
      this.logger.warn(`No RNF-ID in dossier (nbrDossier: ${doss.number})`)
    } else if (doss.state !== DossierState.Accepte) {
      this.logger.warn(
        `Dossier (nbrDossier: ${doss.number}) is not accepted. (${doss.state})`,
      )
      rnfId = null
    }
    return rnfId
  }

  private async _lookForFoundationChange(
    name: string,
    dsDemarcheId: number,
    changeType: string,
  ) {
    this.logger.verbose('_lookForFoundationChange')
    this.logger.log(`Checking for: ${name}`)

    const dsDemarche: IDsApiClientDemarche = await this.dsService.getOneDemarcheWithDossier(
      dsDemarcheId,
      this.dsConfigurationService.configuration.foundationRefreshedAt,
    )

    const dossiers = dsDemarche.demarche.dossiers.nodes
    this.logger.log(`${dossiers.length} dosssiers found`)
    if (!dossiers.length) {
      this.logger.debug(`${name}: No dossier to update.
        ${this.dsConfigurationService.configuration.foundationRefreshedAt}`)
      return
    }

    for (const dossier of dossiers) {
      let rnfId: string | null = null
      try {
        rnfId = await this._checkRnfIdForFoundationChange(dossier)
        if (!rnfId) {
          continue
        }
        this.logger.log(
          `Updating foundation ${rnfId} because of dossier ${dossier.number}`,
        )

        let dto: UpdateFoundationDto = {}
        if (changeType === FoundationChangeType.Modification || changeType === FoundationChangeType.Administration) {
          dto = this.dsMapperService.mapDossierToDto(
            dossier,
            this.dsConfigurationService.getMapperFromDemarcheDsId(dsDemarcheId),
          )
        } else if (changeType === FoundationChangeType.Dissolution) {
          dto = { dissolvedAt: new Date() }
        }

        await this.updateFoundation(rnfId, dto)
      } catch (e) {
        this.logger.error(`Error updating dossier ${dossier.number} and foundation ${rnfId ?? 'no value'}`)
        this.logger.error(e as Error)
        console.log(e)
      }
    }
  }

  private async _checkRnfIdForFoundationChange(dossier: DossierWithCustomChamp) {
    this.logger.verbose('_checkRnfIdForFoundationChange')
    const rnfId = this.checkIfRnfInAcceptedDossier(dossier)
    if (!rnfId) {
      this.logger.verbose(`No RNF-ID in dossier ${dossier.number} or dossier not accepted`)
      return null
    }
    const foundation = await this.prisma.foundation.findFirst({
      where: { rnfId, dissolvedAt: null },
    })
    if (!foundation) {
      this.logger.verbose(`Foundation with rnfId ${rnfId} not found or dissolved`)
      return null
    }
    return rnfId
  }

  //#endregion
}
