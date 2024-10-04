import { Injectable } from '@nestjs/common'
import { IsNull, Not, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { RnfService } from '@/modules/organismes/providers/rnf.service'
import { RnaService } from '@/modules/organismes/providers/rna.service'

import {
  IOrganisme,
  IPerson,
  IPersonRnf,
  IRnaOutput,
  IRnfOutput,
  OrganismeTypeKey,
  PersonRoleKey,
  eOrganismeType,
  eState,
  iRnaDocument,
  eBnConfiguration,
  ISiafRnfOutput,
  IAddress,
  ISiafAssociationOutput,
  ISiafFondationOutput,
} from '@biblio-num/shared'

import { OrganismeFieldTypeHash } from '@/modules/organismes/objects/const/organisme-field-type-hash.const'
import {
  SmallRnaOrganismeDto,
  smallRnaOrganismeDtoKeys,
} from '@/modules/organismes/objects/dto/small-rna-organisme.dto'
import {
  SmallRnfOrganismeDto,
  smallRnfOrganismeDtoKeys,
} from '@/modules/organismes/objects/dto/small-rnf-organisme.dto'
import { PaginationDto } from '@/shared/pagination/pagination.dto'
import { PaginatedDto } from '@/shared/pagination/paginated.dto'
import { DossierService } from '@/modules/dossiers/providers/dossier.service'
import { FileService } from '@/modules/files/providers/file.service'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { UploadRnaFileJobPayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import {
  RnaFileCodeKey,
  rnaFileCodes,
} from '@/modules/files/objects/const/rna-code-to-label-and-tag.const'
import { BnConfigurationService } from '@/shared/modules/bn-configurations/providers/bn-configuration.service'
import { addYears } from 'date-fns'
import { getCodeByRegionName } from '../utils/utils.regions'
import { SiafService } from './siaf.service'

@Injectable()
export class OrganismeService extends BaseEntityService<Organisme> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(Organisme) repo: Repository<Organisme>,
    protected readonly rnfService: RnfService,
    protected readonly rnaService: RnaService,
    protected readonly siafService: SiafService,
    private readonly fileService: FileService,
    protected readonly dossierService: DossierService,
    @InjectQueue(QueueName.file) private readonly fileQueue: Queue,
    private readonly bnConfiguration: BnConfigurationService,
  ) {
    super(repo, logger, OrganismeFieldTypeHash)
    this.logger.setContext(this.constructor.name)
  }

  private async _getOrCreateOrganismeCommun(
    id: string,
    key: 'idRnf' | 'idRna',
  ): Promise<Organisme> {
    this.logger.debug(`from ${key}${id}`)
    const org = await this.repo.findOne({ where: { [key]: id } })
    if (org) {
      return org
    }
    return this.createAndSave({
      [key]: id,
      state: eState.queued,
    })
  }

  private _formatPerson(rawPerson: IPersonRnf): IPerson {
    const role = (rawPerson.roles && rawPerson.roles[0]) as PersonRoleKey || null
    return {
      ...rawPerson.person,
      role,
    } as IPerson
  }

  private _formatPersonSIAFRNF(rawPerson: ISiafRnfOutput['persons'][number]): IPerson {
    return {
      ...Object.fromEntries(
        [
          'createdAt',
          'updatedAt',
          'civility',
          'lastName',
          'firstName',
          'email',
          'phone',
          'profession',
          'nationality',
          'bornAt',
          'bornPlace',
          'isFounder',
          'role',
        ].map((field) => [
          field,
          rawPerson[field] || '',
        ]),
      ),
      address: this._formatAddressSIAFRNF(rawPerson.address),
    } as IPerson
  }

  private _formatAddress(rawAddress: IRnfOutput['address']): Partial<Organisme> {
    return Object.fromEntries(
      [
        'label',
        'postalCode',
        'cityName',
        'type',
        'streetAddress',
        'streetNumber',
        'streetName',
        'departmentName',
        'departmentCode',
        'regionName',
        'regionCode',
      ].map((field) => [
        `address${field.charAt(0).toUpperCase()}${field.substring(1)}`,
        rawAddress[field] || '',
      ]),
    )
  }

  private _formatAddressSIAFRNF(rawAddress: ISiafRnfOutput['address'] | undefined): IAddress {
    const contextSplit = rawAddress?.gouvAddress?.context?.split(',')
    const codeDepAndRegion = {
      departmentName: '',
      departmentCode: '',
      regionName: '',
      regionCode: '',
    }
    if (contextSplit) {
      codeDepAndRegion.departmentName = contextSplit[1] || ''
      codeDepAndRegion.departmentCode = contextSplit[0] || ''
      codeDepAndRegion.regionName = contextSplit[2] || ''
      codeDepAndRegion.regionCode = getCodeByRegionName(contextSplit[2]) || ''
    }

    return {
      label: rawAddress?.gouvAddress?.label || rawAddress?.dsStringValue || '',
      postalCode: rawAddress?.gouvAddress?.postcode || '',
      cityName: rawAddress?.gouvAddress?.city || '',
      cityCode: rawAddress?.gouvAddress?.citycode || '',
      type: rawAddress?.gouvAddress?.type || '',
      streetAddress: rawAddress?.gouvAddress?.street || '',
      streetNumber: rawAddress?.gouvAddress?.housenumber || '',
      streetName: rawAddress?.gouvAddress?.name || '',
      ...codeDepAndRegion,
    }
  }

  async getOrCreateOrganismeIdFromRna(idRna: string): Promise<Organisme> {
    this.logger.verbose(`getOrCreateOrganismeIdFromRna ${idRna}`)
    return this._getOrCreateOrganismeCommun(idRna, 'idRna')
  }

  async getOrCreateOrganismeIdFromRnf(idRnf: string): Promise<Organisme> {
    this.logger.verbose(`getOrCreateOrganismeIdFromRnf ${idRnf}`)
    return this._getOrCreateOrganismeCommun(idRnf, 'idRnf')
  }

  async getMissingYears(
    createdAt: Date,
    alreadyDeclaredYear?: number[],
  ): Promise<number[]> {
    this.logger.verbose('getMissingYears')
    const configYear = await this.bnConfiguration
      .findByKeyName(eBnConfiguration.DDC_FIRST_CONTROL_YEAR)
      .then((c) => parseInt(c.stringValue, 10))
    const creationYear = createdAt.getFullYear()
    const biggerYear = Math.max(creationYear, configYear)
    const lastCurrentYear = addYears(new Date(), -1).getFullYear()
    const result = []
    for (let i = biggerYear; i <= lastCurrentYear; i++) {
      if (!alreadyDeclaredYear?.includes(i)) {
        result.push(i)
      }
    }
    return result
  }

  async updateOrganismeFromRnf(
    idRnf: string,
    raw: IRnfOutput | ISiafRnfOutput,
    firstTime = false,
    enabledSiaf = false,
  ): Promise<void> {
    this.logger.verbose(`updateOrganismeFromRnf ${idRnf}`)

    const creationDate = new Date(raw.originalCreatedAt)
    const toUpdate: Partial<Organisme> = {
      state: eState.uploaded,
      title: raw.title,
      dateCreation: raw.originalCreatedAt,
      type: enabledSiaf ? (raw as ISiafRnfOutput).foundationType : (raw as IRnfOutput).type as OrganismeTypeKey,
      email: raw.email,
      phoneNumber: raw.phone,
      ...this._formatAddress(enabledSiaf
        ? this._formatAddressSIAFRNF((raw as ISiafRnfOutput).address)
        : (raw as IRnfOutput).address),
      dateDissolution: enabledSiaf ? (raw as ISiafRnfOutput).dissolved.dissolvedAt : (raw as IRnfOutput).dissolvedAt,
      fiscalEndDateAt: raw.fiscalEndDateAt,
      rnfJson: raw,
      persons: raw.persons && raw.persons.length
        ? raw.persons.map((p) => enabledSiaf
          ? this._formatPersonSIAFRNF(p)
          : this._formatPerson(p))
        : [],
    }

    // TODO: this should not happen once all the date is on RNF
    // TODO: this case is happening because we have conflict over RNF  data and BN data
    if (firstTime) {
      toUpdate.declarationYears = raw.declarationYears
      toUpdate.missingDeclarationYears = await this.getMissingYears(
        creationDate,
        raw.declarationYears,
      )
    }
    await this.repo.update({ idRnf }, toUpdate)
  }

  async updateOrganismeFromRna(idRna: string, raw: IRnaOutput): Promise<void> {
    this.logger.verbose(`updateOrganismeFromRna ${idRna}`)
    // TODO: A factoriser
    const a = raw.adresse_siege || null
    const addressStreetAddress = a
      ? ['numero_voie', 'type_voie', 'libelle_voie']
        .map((k) => a[k])
        .filter((a) => !!a)
        .join(' ')
      : null
    const addressLabel = a
      ? `${addressStreetAddress} ${['code_postal', 'commune']
        .map((k) => a[k])
        .filter((a) => !!a)
        .join(' ')}`
      : null
    const creationDate = new Date(raw.date_creation)
    await this.repo.update(
      {
        idRna,
      },
      {
        state: eState.uploaded,
        title: raw.nom,
        dateCreation: creationDate,
        type: raw.reconnue_utilite_publique
          ? eOrganismeType.ARUP
          : eOrganismeType.CULTE,
        addressLabel,
        addressPostalCode: a?.code_postal,
        addressCityName: a?.commune,
        addressType: a?.type_voie,
        addressStreetAddress,
        addressStreetNumber: a?.numero_voie,
        addressStreetName: a?.libelle_voie,
        dateDissolution: raw.date_dissolution,
        rnaJson: raw,
        declarationYears: [],
        missingDeclarationYears: [],
      },
    )
  }

  // TODO: cf organisme.processor
  async getAllRnaOrganisme(): Promise<SmallRnaOrganismeDto[]> {
    return this.repository.find({
      where: { idRna: Not(IsNull()), state: eState.uploaded },
      select: smallRnaOrganismeDtoKeys,
    })
  }

  async getAllRnfOrganisme(): Promise<SmallRnfOrganismeDto[]> {
    return this.repository.find({
      where: { idRnf: Not(IsNull()), state: eState.uploaded },
      select: smallRnfOrganismeDtoKeys,
    })
  }

  async listOrganisme(
    dto: PaginationDto<IOrganisme>,
    skipLimit: boolean = false,
  ): Promise<PaginatedDto<IOrganisme>> {
    this.logger.verbose('listOrganisme')
    // TODO: change uploaded to synchronised.
    return this.paginate<IOrganisme>(dto, { state: eState.uploaded }, [], skipLimit)
  }

  async synchroniseRnaFiles(rnaId: string, rawRna: IRnaOutput): Promise<void> {
    this.logger.verbose('synchroniseRnaFiles')
    if (rawRna.documents_rna?.length) {
      const organismeId = await this.findOneOrThrow({
        where: { idRna: rnaId },
        select: ['id'],
      }).then((o) => o.id)
      await Promise.all(
        rawRna.documents_rna
          .filter((doc) =>
            rnaFileCodes.includes(doc.sous_type?.code as RnaFileCodeKey),
          )
          .filter((doc) => !!doc.url)
          .map(async (doc: iRnaDocument) => {
            const tagAndLabel = FileService.computeLabelAndTagForRna(doc)
            const file = await this.fileService.createFromRnaIfNew({
              ...tagAndLabel,
              organismeId,
              sourceStringId: doc.id,
            })
            if (file) {
              this.fileQueue.add(eJobName.UploadRnaFile, {
                file,
                rnaUrl: doc.url,
              } as UploadRnaFileJobPayload)
            }
          }),
      )
    }
  }

  async getAllOrganismeWithoutYear(year: number): Promise<Organisme[]> {
    this.logger.verbose('getAllOrganismeWithoutYear')
    return this.repo
      .createQueryBuilder('entity')
      .where(
        `NOT ("entity"."declarationYears" @> '${year}')`,
      )
      .andWhere(
        `NOT("entity"."missingDeclarationYears" @> '${year}')`,
      )
      .andWhere('"entity"."idRnf" IS NOT NULL')
      .getMany()
  }

  async getAssocationFromSiaf(idRna: string): Promise< ISiafAssociationOutput | null> {
    this.logger.verbose('getAssocationFromSiaf')
    const enableSiaf = await this.bnConfiguration.getValueByKeyName(eBnConfiguration.ENABLE_SIAF)
    if (!enableSiaf) return null
    const fromSiaf = await this.siafService.getAssociation(idRna)
    this.logger.debug({ FN: 'getAssocationFromSiaf', idRna })
    if (!fromSiaf) return null
    return fromSiaf.associations
  }

  async getFondationFromSiaf(idRnf: string): Promise<ISiafFondationOutput | null> {
    this.logger.verbose('getFondationFromSiaf')
    const enableSiaf = await this.bnConfiguration.getValueByKeyName(eBnConfiguration.ENABLE_SIAF)
    if (!enableSiaf) return null
    const fromSiaf = await this.siafService.getFoundation(idRnf)
    this.logger.debug({ FN: 'getFondationFromSiaf', idRnf })
    if (!fromSiaf) return null
    return fromSiaf.fondations
  }
}
