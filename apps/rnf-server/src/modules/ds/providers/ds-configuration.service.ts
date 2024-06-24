import { BadRequestException, forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'
import { DsConfigurationEntity } from '@/modules/ds/objects/ds-configuration.entity'
import { MappersAndKeys } from '@/modules/ds/objects/types/mappers-and-keys.type'
import {
  demandeNumeroRnfMapper,
  fddCreationMapper,
  fddModificationMapper,
  feCreationMapper,
  feModificationMapper,
  feAdministrationChangesMapper,
  fddAdministrationChangesMapper,
} from '@/modules/ds/objects/mappers'
import { RnfFieldKey } from '@/modules/ds/objects/types/rnf-field-keys.type'
import { Mapper } from '@/modules/ds/objects/types/mapper.type'
import { CronService } from '@/modules/cron/cron.service'

@Injectable()
export class DsConfigurationService implements OnModuleInit {
  //#region GETTERS
  private _configuration: DsConfigurationEntity
  get configuration(): DsConfigurationEntity {
    return this._configuration
  }

  private _mappersAndKeys: MappersAndKeys
  get mappersAndKeys(): MappersAndKeys {
    return this._mappersAndKeys
  }

  get mappers(): Map<string, Mapper> {
    return this.mappersAndKeys.mappers
  }

  get rnfFieldKeys(): RnfFieldKey {
    return this.mappersAndKeys.rnfFieldKeys
  }

  //#endregion

  constructor(
    private logger: LoggerService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => CronService))
    private readonly cronService: CronService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  //#region private
  private _initMappersAndKeys(): MappersAndKeys {
    this.logger.verbose('_initMappers')
    return {
      mappers: new Map<string, Mapper>(
        Object.entries({
          [this.configuration.dsDemarcheFDDCreationId]: fddCreationMapper,
          [this.configuration.dsDemarcheFECreationId]:
            feCreationMapper,
          [this.configuration.dsDemarcheDNRId]: demandeNumeroRnfMapper,
          [this.configuration.dsDemarcheFEModificationId]: feModificationMapper,
          [this.configuration.dsDemarcheFDDModificationId]:
            fddModificationMapper,
          [this.configuration.dsDemarcheFEAdministrationChangesId]:
            feAdministrationChangesMapper,
          [this.configuration.dsDemarcheFDDAdministrationChangesId]:
            fddAdministrationChangesMapper,
        }),
      ),
      rnfFieldKeys: {
        title: new RegExp(`.*${this.configuration.fieldRegexTitle}.*`),
        type: new RegExp(`.*${this.configuration.fieldRegexType}.*`),
        address: new RegExp(`.*${this.configuration.fieldRegexAddress}.*`),
        email: new RegExp(`.*${this.configuration.fieldRegexEmail}.*`),
        phone: new RegExp(`.*${this.configuration.fieldRegexPhone}.*`),
        personInFoundationToCreate: new RegExp(
          `.*${this.configuration.fieldRegexPerson}.*`,
        ),
        rnfId: new RegExp(`.*${this.configuration.fieldRegexRnfId}.*`),
        status: new RegExp(`.*${this.configuration.fieldRegexStatus}.*`),
        personQuality: new RegExp(`.*${this.configuration.fieldRegexPersonQuality}.*`),
        personCivility: new RegExp(`.*${this.configuration.fieldRegexPersonCivility}.*`),
        personFirstName: new RegExp(`.*${this.configuration.fieldRegexPersonFirstName}.*`),
        personLastName: new RegExp(`.*${this.configuration.fieldRegexPersonLastName}.*`),
        personBornAt: new RegExp(`.*${this.configuration.fieldRegexPersonBornAt}.*`),
        personBornPlace: new RegExp(`.*${this.configuration.fieldRegexPersonBornPlace}.*`),
        personNationality: new RegExp(`.*${this.configuration.fieldRegexPersonNationality}.*`),
        personProfession: new RegExp(`.*${this.configuration.fieldRegexPersonProfession}.*`),
        personAddress: new RegExp(`.*${this.configuration.fieldRegexPersonAddress}.*`),
        personPhone: new RegExp(`.*${this.configuration.fieldRegexPersonPhone}.*`),
        personIsFounder: new RegExp(`.*${this.configuration.fieldRegexPersonIsFounder}.*`),
        personRole: new RegExp(`.*${this.configuration.fieldRegexPersonRole}.*`),
        personAdministrator: new RegExp(`.*${this.configuration.fieldRegexAdministator}.*`),
        fiscalEndDateAt: new RegExp(`.*${this.configuration.fieldRegexFiscalEndDate}.*`),
        declarationYears: new RegExp(`.*${this.configuration.fieldRegexDeclarationYears}.*`),
        originalCreatedAt: new RegExp(`.*${this.configuration.fieldRegexCreatedAt}.*`),
        department: new RegExp(`.*${this.configuration.fieldRegexDepartment}.*`),
      },
    }
  }

  private async _refreshConfiguration() {
    const configuration = await this._loadConfiguration()
    if (!configuration) {
      this.logger.warn(
        'Configuration has never been generated. Generating default configuration.',
      )
      this._configuration = await this.prisma.dSConfiguration.create({
        data: {},
      })
    } else {
      this._configuration = configuration
    }
    this._mappersAndKeys = this._initMappersAndKeys()
  }

  async onModuleInit() {
    this.logger.verbose('onModuleInit')
    await this._refreshConfiguration()
  }

  private async _loadConfiguration(): Promise<DsConfigurationEntity | null> {
    this.logger.verbose('_loadConfiguration')
    return this.prisma.dSConfiguration.findFirst({ where: { id: 1 } })
  }

  //#endregion

  getMapperFromDemarcheDsId(demarcheDsId: number | string): Mapper {
    this.logger.verbose('getMapperFromDemarcheDsId')
    const mapper: Mapper | undefined = this.mappers.get(`${demarcheDsId}`)
    if (!mapper) {
      throw new BadRequestException('This demarche id is not implemented')
    }
    return mapper
  }

  async updateConfiguration(
    data: Partial<DsConfigurationEntity>,
  ): Promise<boolean> {
    this.logger.verbose('updateConfiguration')
    if (!data) {
      throw new BadRequestException('No change provided')
    }
    await this.prisma.dSConfiguration.update({
      where: { id: 1 },
      data,
    })
    await this._refreshConfiguration()
    if (data.cronUpdateFrequency) {
      this.cronService.updateCron()
    }
    return true
  }

  getAnnotationIdByDemarcheId(demarcheId: number) : string | undefined {
    return ({
      [this.configuration.dsDemarcheFDDCreationId]: this.configuration.dsDemarcheFDDCreationAnnotationId,
      [this.configuration.dsDemarcheFECreationId]: this.configuration.dsDemarcheFECreationAnnotationId,
      [this.configuration.dsDemarcheDNRId]: this.configuration.dsDemarcheDNRAnnotationId,
    }[demarcheId])
  }
}
