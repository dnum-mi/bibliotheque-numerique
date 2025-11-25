import { BadRequestException, Injectable } from '@nestjs/common'
import { In, IsNull, Not, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'

import {
  IOrganisme,
  IRnaOutput,
  eOrganismeType,
  eState,
  iRnaDocument,
  eBnConfiguration,
  IFoundationOutput,
  IAddress,
  ISiafSearchOrganismeResponseOutput,
  IAssociationOutput,
  IOrganismeOutput,
  typeCategorieOrganisme,
  Prefecture,
  IOrganismeOutputDto,
  IDsEvent,
  // ISiafRnfHistoryOutput,
} from '@biblio-num/shared'

import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'

import { LoggerService } from '@/shared/modules/logger/logger.service'

import { RnaService } from '@/modules/organismes/providers/rna.service'

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
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { UploadRnaFileJobPayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import {
  RnaFileCodeKey,
  rnaFileCodes,
} from '@/modules/files/objects/const/rna-code-to-label-and-tag.const'
import { BnConfigurationService } from '@/shared/modules/bn-configurations/providers/bn-configuration.service'
import { addYears } from 'date-fns'
import { HubService } from '@/modules/hub/providers/hub.service'
import { GetUpdateFoundationInputDto } from '../objects/dto/get-updated-foundation-input.dto'
import { eFileStorageIn, FileStorageInKey } from '../../files/objects/const/file-storage-in.enum'
import { tFileCommon } from '../../files/objects/types/file-common.type'
import { FileOrganismeHubService } from '../../files/providers/file-organisme-hub.service'
import { OrganismeSyncService } from './organisme-sync.service'
import { TransformRna } from '../utils/transform-rna'
import { getDissolvedAt } from './organisme.utils'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'

@Injectable()
export class OrganismeService extends BaseEntityService<Organisme> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(Organisme) repo: Repository<Organisme>,
    protected readonly rnaService: RnaService,
    protected readonly hubService: HubService,
    private readonly fileService: FileService,
    private readonly fileOrganismeHubService: FileOrganismeHubService,
    protected readonly dossierService: DossierService,
    protected readonly demarcheService: DemarcheService,
    @InjectQueue(QueueName.file) private readonly fileQueue: Queue,
    private readonly bnConfiguration: BnConfigurationService,
    private readonly organismeSync: OrganismeSyncService,
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

  private _formatAddress(
    rawAddress: IAddress,
  ): Partial<Organisme> {
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
    raw: IFoundationOutput,
    firstTime = false,
  ): Promise<void> {
    this.logger.verbose(`updateOrganismeFromRnf ${idRnf}`)
    const creationDate = raw.creationAt && new Date(raw.creationAt)
    const toUpdate: Partial<Organisme> = {
      state: eState.uploaded,
      title: raw.title,
      dateCreation: creationDate,
      // @ts-ignore -- A regarder pourquoi le type est incorrect
      type: raw.foundationType,
      email: raw.email,
      phoneNumber: raw.phone,
      ...this._formatAddress(
        raw.address.dsAddress,
      ),
      dateDissolution: getDissolvedAt(raw),
      fiscalEndDateAt: raw.fiscalEndAt,
      rnfJson: raw,
      persons: raw.persons,
    }

    // TODO: this should not happen once all the date is on RNF
    // TODO: this case is happening because we have conflict over RNF  data and BN data
    if (firstTime) {
      toUpdate.declarationYears = raw.accountDepositYears
      toUpdate.missingDeclarationYears = await this.getMissingYears(
        raw.createdAt,
        raw.accountDepositYears,
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
        type: eOrganismeType.ASSO,
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

  async updateOrganismeRnaFromHub(
    raw: IAssociationOutput)
    : Promise<void> {
    const factoryTransformSiafRna = new TransformRna(raw)
    const rnaToUpdate = factoryTransformSiafRna.toOrganisme()
    const addressSiege = factoryTransformSiafRna.addressSiege
    const rnaAddress = factoryTransformSiafRna.rnaAddressSiege
    const gouvAddress = addressSiege?.rnaAddress.gouvAddress
    const dsAddress = addressSiege.dsAddress

    await this.repo.update(
      {
        idRna: raw.id,
      },
      {
        ...rnaToUpdate as Organisme,
        state: eState.uploaded,
        addressPostalCode: dsAddress?.postalCode ||
          gouvAddress?.postcode ||
          addressSiege?.rnaAddress?.address.codepostal ||
          '',
        addressCityName: dsAddress?.cityName ||
          gouvAddress?.city ||
          rnaAddress?.libcommune ||
          '',
        addressType: dsAddress?.type ||
          gouvAddress?.type ||
          rnaAddress?.typevoie ||
          '',
        addressStreetAddress: factoryTransformSiafRna.getAddressStreetAddress(),
        addressStreetNumber: dsAddress?.streetNumber ||
          gouvAddress?.housenumber ||
          rnaAddress?.numvoie ||
          '',
        addressStreetName: dsAddress?.streetName ||
          gouvAddress?.street ||
          rnaAddress?.libvoie,
        dateDissolution: getDissolvedAt(raw),
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
    return this.paginate<IOrganisme>(
      dto,
      { state: eState.uploaded },
      [],
      skipLimit,
    )
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
      .where(`NOT ("entity"."declarationYears" @> '${year}')`)
      .andWhere(`NOT("entity"."missingDeclarationYears" @> '${year}')`)
      .andWhere('"entity"."idRnf" IS NOT NULL')
      .getMany()
  }

  /**
   * TODO: Pour avoir la possibilité à se connecter avec le RAF et le HUB sans la variable env pour les distinguer,
   * pour le hub la structure contient la clé associations
   * TODO: A la fin, bn doit être connecter avec le hub
   */
  async getAssocationFromHub(
    idRna: string,
  ): Promise<IAssociationOutput | null> {
    this.logger.verbose('getAssocationFromHub')
    const fromSiaf = await this.hubService.getAssociation(idRna)
    this.logger.debug({ FN: 'getAssocationFromSiaf', idRna })
    if (!fromSiaf) return null
    if ('associations' in fromSiaf) {
      return fromSiaf.associations
    } else {
      return fromSiaf
    }
  }

  /**
   * TODO: Pour avoir la possibilité à se connecter avec le RAF et le HUB sans la variable env pour les distinguer,
   * pour le hub la structure contient la clé fondations
   * TODO: A terme, bn doit-être connecter avec le hub
   */
  async getFoundationFromHub(id: string): Promise<IFoundationOutput | null> {
    this.logger.verbose('getFoundationFromHub')
    const fromSiaf = await this.hubService.getFoundation(id)
    this.logger.debug({ FN: 'getFoundationFromSiaf', id, found: !!fromSiaf })
    if (!fromSiaf) return null
    if ('fondations' in fromSiaf) {
      return fromSiaf.fondations
    } else {
      return fromSiaf
    }
  }

  async searchOrganismes(
    sentence: string,
  ): Promise<ISiafSearchOrganismeResponseOutput[] | null> {
    this.logger.verbose('searchOrganismes')
    const enableHubSearch = await this.bnConfiguration.getValueByKeyName(
      eBnConfiguration.ENABLE_HUB_SEARCH,
    )
    if (!enableHubSearch) return null
    return (await this.hubService.searchOrganisme(sentence))?.search_response
  }

  private _prefectureFn(cp: string): string {
    if (!cp) return ''
    let prefkey = ''
    if (+cp.substring(0, 3) >= 200 && +cp.substring(0, 3) <= 201) {
      prefkey = 'D2A' // Corse du Sud
    } else if (+cp.substring(0, 3) >= 202 && +cp.substring(0, 3) <= 209) {
      prefkey = 'D2B' // Haute-Corse
    } else prefkey = `D${cp.substring(0, 2) || ''}`

    return Prefecture[prefkey as keyof typeof Prefecture] || ''
  }

  private _transformRnfToOrganismeDto(
    organisme: Organisme,
  ): IOrganismeOutputDto {
    return {
      ...organisme,
      siege: {
        coordinates: (organisme?.rnfJson as IFoundationOutput)?.address
          ?.coordinates,
        prefecture: this._prefectureFn(organisme?.addressPostalCode),
        isVerified: !!organisme?.addressType,
      },
      objectDescription: (organisme?.rnfJson as IFoundationOutput)
        ?.socialObject,
      dueDate: (organisme?.rnfJson as IFoundationOutput)?.dueDate,
      generalInterest: (organisme?.rnfJson as IFoundationOutput)?.generalInterestDomain,
      internationalAction: (organisme?.rnfJson as IFoundationOutput)
        ?.hasInternationalActivity,
      createdAt: (organisme?.rnfJson as IFoundationOutput)?.createdAt,
      updatedAt: (organisme?.rnfJson as IFoundationOutput)?.updatedAt,
      fiscalEndDateAt: (organisme?.rnfJson as IFoundationOutput)?.fiscalEndAt,
      siret: organisme?.rnfJson?.siret,

    }
  }

  async getOrganismeRnfFromAllServer(idRnf: string): Promise<IOrganismeOutput> {
    this.logger.verbose('getOrganismeRnfFromAllServer')
    // Remarque: Si ENABLE_HUB_SEARCH = true et SYNC_RNF_VIA_HUB = false
    //   alors le fondation peut ne pas être à jours.
    //   La donnée récupére provinedra du RAF et non du HUB
    // TODO: IOrganismeOutput doit contenir que bn Pour siaf complet
    const returnedOrganisme: IOrganismeOutput = {
      bn: null,
      siaf: null,
      syncState: null,
      type: typeCategorieOrganisme.rnf,
    }

    const rnf = await this.repo.findOne({ where: { idRnf } })
    if (!rnf) {
      return returnedOrganisme
    }

    if (rnf?.syncState?.state) {
      if (rnf.syncState.state === eState.failed && rnf.type === eOrganismeType.unknown) return returnedOrganisme
      returnedOrganisme.dossiersCount = await this.dossierService.countDossiersByOrganismeId(
        rnf.id,
      )
    }

    returnedOrganisme.bn = rnf && this._transformRnfToOrganismeDto(rnf)
    return returnedOrganisme
  }

  async addRnfWithSyncPriority (idRnf: string): Promise<void> {
    const enableHubSearch = await this.bnConfiguration.getValueByKeyName(
      eBnConfiguration.ENABLE_HUB_SEARCH,
    )
    if (!enableHubSearch) return

    const rnf = await this.getOrCreateOrganismeIdFromRnf(idRnf)
    if (rnf && rnf.type !== eOrganismeType.unknown) return

    if (rnf.syncState?.state === eState.uploading) return
    await this.organismeSync.addSyncOneRnf(idRnf, 1)
  }

  async addRnaWithSyncPriority (idRna: string): Promise<void> {
    const enableHubSearch = await this.bnConfiguration.getValueByKeyName(
      eBnConfiguration.ENABLE_HUB_SEARCH,
    )
    if (!enableHubSearch) return

    const rnf = await this.getOrCreateOrganismeIdFromRna(idRna)
    if (rnf && rnf.type !== eOrganismeType.unknown) return

    if (rnf.syncState?.state === eState.uploading) return
    await this.organismeSync.addSyncOneRna(idRna, 1)
  }

  // TODO: A refaire avec le nouveau modele
  async getOrganismeRnfEvents(
    idRnf: string,
  ): Promise<IDsEvent<IFoundationOutput> | null> {
    this.logger.verbose('getOrganismeRnfHistoryFromSiaf')
    this.logger.debug(idRnf)
    const hubEvents = await this.hubService.getFoundationEvents(idRnf)

    if (!hubEvents?.events?.length) {
      return null
    }

    const dossiersIds = [
      ...new Set(hubEvents.events
        .map(event => String(event.dossierNumber))
        .filter(id => id && id !== 'NaN'),
      ),
    ]
    const demarcheIds = [
      ...new Set(
        hubEvents.events
          .map(event => Number(event.demarcheNumber))
          .filter(id => !isNaN(id) && id > 0),
      ),
    ]

    const [localDossiers, localDemarches] = await Promise.all([
      dossiersIds.length > 0
        ? this.dossierService.findWithFilter({
          sourceId: In(dossiersIds),
        }, {}, { id: true, sourceId: true })
        : [] as Dossier[],

      demarcheIds.length > 0
        ? this.demarcheService.findWithFilter({
          dsId: In(demarcheIds),
        }, {}, { id: true, title: true, dsId: true })
        : [] as Demarche[],
    ])

    const dossiersMap = new Map(localDossiers.map(d => [d.sourceId, d.id]))
    const demarchesMap = new Map(localDemarches.map(d => [d.dsId, { id: d.id, name: d.title }]))

    return {
      ...hubEvents,
      events: hubEvents.events.map((event) => {
        const dossierKey = String(event.dossierNumber)
        const demarcheKey = Number(event.demarcheNumber)
        const localDemarcheInfo = demarchesMap.get(demarcheKey)

        return {
          ...event,
          dossierLocalNumber: dossiersMap.get(dossierKey) || null,
          demarcheLocalId: localDemarcheInfo?.id || null,
          demarcheLocalName: localDemarcheInfo?.name || null,
        }
      }),
    }
  }

  private _transformRnaToOrganismeDto(
    organisme: Organisme,
  ): IOrganismeOutputDto {
    return {
      ...organisme,
      siege: {
        prefecture: this._prefectureFn(organisme?.addressPostalCode),
        isVerified: !!organisme?.addressType,
      },
    }
  }

  private _transformSiafRnaToOrganismeDto(
    organisme: Organisme,
  ): IOrganismeOutputDto {
    const rawJson = organisme.rnaJson as IAssociationOutput
    const _factoryTransformSiafRna = new TransformRna(rawJson)
    const addressSiege = _factoryTransformSiafRna.addressSiege

    return {
      ...organisme,
      siret: rawJson.siret,
      siege: {
        coordinates: addressSiege?.coordinates,
        prefecture: this._prefectureFn(
          addressSiege?.dsAddress?.postalCode ||
          addressSiege?.rnaAddress?.gouvAddress?.postcode ||
          addressSiege?.rnaAddress?.address.codepostal,
        ),
        isVerified: !!(addressSiege?.coordinates),
      },
      websites: rawJson?.website,
      objectDescription: rawJson?.socialObject,
      generalInterest: rawJson.activityDomainDescription, // TODO: A verfier
      createdAt: organisme?.createdAt,
      updatedAt: organisme?.updatedAt,
    } as IOrganismeOutputDto
  }

  async getOrganismeRnaFromAllServer(idRna: string): Promise<IOrganismeOutput> {
    this.logger.verbose('getOrganismeRnfFromAllServer')
    // Remarque: Si ENABLE_HUB_SEARCH = true et SYNC_RNA_VIA_HUB = false
    //   alors l'association peut ne pas être à jours ou non trouvé.
    //   La donnée récupére provinedra de l'api entreprise et non du HUB

    const returnedOrganisme: IOrganismeOutput = {
      bn: null,
      siaf: null,
      syncState: null,
      type: typeCategorieOrganisme.rna,
    }

    const rna = await this.repo.findOne({ where: { idRna } })
    if (!rna) return returnedOrganisme
    returnedOrganisme.syncState = rna.syncState
    if (!rna.rnaJson) {
      returnedOrganisme.bn = rna
      return returnedOrganisme
    }

    if ('rna' in rna.rnaJson) {
      returnedOrganisme.bn = this._transformRnaToOrganismeDto(rna)
    } else {
      returnedOrganisme.bn = this._transformSiafRnaToOrganismeDto(rna)
    }

    returnedOrganisme.dossiersCount = await this.dossierService.countDossiersByOrganismeId(rna.id)

    return returnedOrganisme
  }

  async deleteOrganismeIfNotInDossiers(id: number): Promise<string> {
    this.logger.verbose('deleteOrganisme')
    const numberOrganisme = await this.findOneOrThrow({ where: { id } }).then(
      (o) => o.idRna || o.idRnf,
    )
    const dossiersFound = await this.dossierService.findWithFilter({
      organisme: { id },
    })
    if (dossiersFound.length > 0) {
      throw new BadRequestException('Organisme is used in dossiers')
    }
    await this.fileService.deleteByOrganismeIdOnly(id)
    const deleted = await this.repo.delete(id)
    if (!deleted.affected) {
      throw new BadRequestException('Organisme not found')
    }
    this.logger.log(`Organisme ${numberOrganisme} ${id} deleted`)
    return numberOrganisme
  }

  // #region sync rna from hub
  async synchroniseRnaFilesFromHub(rawRna: IAssociationOutput): Promise<void> {
    this.logger.verbose('synchroniseRnaFilesFromHub')
    const files = this.fileOrganismeHubService.getFilesFromRawRna(rawRna)
    if (!files.length) {
      this.logger.debug(`Not files for ${rawRna.id}`)
      return
    }

    const organismeId = await this.findOneOrThrow({
      where: { idRna: rawRna.id },
      select: ['id'],
    }).then((o) => o.id)

    this.fileOrganismeHubService.checkAndCreateFiles({
      sourceLabel: 'rna',
      storageIn: eFileStorageIn.HUB,
      organismeId,
      state: eState.uploaded,
    },
    files)
  }
  // #endregion sync rna from hub

  // #region sync rnf from hub
  async getLastUpdatedFoundations(
    args: GetUpdateFoundationInputDto,
  ): Promise<string[]> {
    this.logger.log('getLastUpdatedFoundations')
    let rnfIds: string[] = []
    let scrollId: string | undefined
    let max
    let count = 0
    do {
      const results = await this.hubService.getLastImportedFoundations(
        args.lastUpdatedAt,
        scrollId,
      )
      scrollId = results?.scroll_id
      if (results?.fondations) {
        rnfIds = rnfIds.concat(
          results.fondations
            ?.map((f) => f.id)
            .filter((id) => args.rnfIds.includes(id)),
        )
        max = results.total_records
        count += results.fondations.length
      }
      // TODO: A vérifier l'utiliter
      // (est-ce que le total records le nombre complet des documents ou seulement ceux de la reponse )
      if (count >= max) {
        break
      }
    } while (scrollId)

    return rnfIds
  }

  async synchroniseRnfFiles(
    rnfId: string,
    rawRnf: IFoundationOutput,
  ): Promise<void> {
    this.logger.verbose('synchroniseRnfFiles')
    const organismeId = await this.findOneOrThrow({
      where: { idRnf: rnfId },
      select: ['id'],
    }).then((o) => o.id)

    const fileCommon: tFileCommon = {
      sourceLabel: 'rnf',
      storageIn: eFileStorageIn.HUB,
      organismeId,
      state: eState.uploaded,
    }
    await this.fileOrganismeHubService.synchroniseRnfFiles(
      rawRnf.files,
      rawRnf.updatedAt,
      fileCommon,
    )
  }

  async deleteFilesOfRnf(idRnf: string, storageIn: FileStorageInKey): Promise<void> {
    const organisme = await this.repo.findOneBy({ idRnf })
    if (!organisme) return

    await this.fileService.deleteFiles({ organismeId: organisme.id, dossierId: null, storageIn })
  }
  // #endregion sync rnf from hub
}
