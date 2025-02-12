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
  ISiafSearchOrganismeResponseOutput,
  ISiafRnaOutput,
  IOrganismeOutput,
  typeCategorieOrganisme,
  Prefecture,
  ISiafAssociationOutput,
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
import { HubService } from './hub.service'
import { IOrganismeOutputDto } from '@biblio-num/shared/src/organismes/organsime-output-dto.interface'

@Injectable()
export class OrganismeService extends BaseEntityService<Organisme> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(Organisme) repo: Repository<Organisme>,
    protected readonly rnfService: RnfService,
    protected readonly rnaService: RnaService,
    protected readonly siafService: HubService,
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

  /**
   * TODO: Pour avoir la possibilité à se connecter avec le RAF et le HUB sans la variable env pour les distinguer,
   * pour le hub la structure contient la clé associations
   * TODO: A terme, bn doit-être connecter avec le hub
  */
  async getAssocationFromSiaf(idRna: string): Promise< ISiafRnaOutput | ISiafAssociationOutput | null> {
    this.logger.verbose('getAssocationFromSiaf')
    const enableSiaf = await this.bnConfiguration.getValueByKeyName(eBnConfiguration.ENABLE_SIAF)
    if (!enableSiaf) return null
    const fromSiaf = await this.siafService.getAssociation(idRna)
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
  async getFoundationFromSiaf(idRnf: string): Promise<ISiafRnfOutput | null> {
    this.logger.verbose('getFoundationFromSiaf')
    const enableSiaf = await this.bnConfiguration.getValueByKeyName(eBnConfiguration.ENABLE_SIAF)
    if (!enableSiaf) return null
    const fromSiaf = await this.siafService.getFoundation(idRnf)
    this.logger.debug({ FN: 'getFoundationFromSiaf', idRnf, found: !!fromSiaf })
    if (!fromSiaf) return null
    if ('fondations' in fromSiaf) {
      return fromSiaf.fondations
    } else {
      return fromSiaf
    }
  }

  async searchOrganismes(sentence: string): Promise<ISiafSearchOrganismeResponseOutput[] | null> {
    this.logger.verbose('searchOrganismes')
    const enableSiaf = await this.bnConfiguration.getValueByKeyName(eBnConfiguration.ENABLE_SIAF)
    if (!enableSiaf) return null
    return (await this.siafService.searchOrganisme(sentence))?.search_response
  }

  private _getValueFromPromiseSettle<T>(type:string, result: PromiseSettledResult<T>):T|null {
    if (result.status === 'rejected') {
      this.logger.warn(`HUB-${type}: ${result.reason}`)
      return null
    }
    return result.value
  }

  private _prefectureFn (cp: string): string {
    if (!cp) return ''
    const prefkey = `D${cp.substring(0, 2) || ''}`
    return Prefecture[prefkey as keyof typeof Prefecture] || ''
  }

  private _transformRnfToOrganismeDto (organisme: Organisme): IOrganismeOutputDto {
    return {
      ...organisme,
      siege: {
        coordinates: (organisme?.rnfJson as ISiafRnfOutput)?.address?.coordinates,
        prefecture: this._prefectureFn(organisme?.addressPostalCode),
        isVerified: !!(organisme?.addressType),
      },
      objectDescription: (organisme?.rnfJson as ISiafRnfOutput)?.objectDescription,
      dueDate: (organisme?.rnfJson as ISiafRnfOutput)?.dueDate,
      generalInterest: (organisme?.rnfJson as ISiafRnfOutput)?.generalInterest,
      internationalAction: (organisme?.rnfJson as ISiafRnfOutput)?.internationalAction,
      createdAt: (organisme?.rnfJson as ISiafRnfOutput)?.createdAt,
      updatedAt: (organisme?.rnfJson as ISiafRnfOutput)?.updatedAt,
      fiscalEndDateAt: (organisme?.rnfJson as ISiafRnfOutput)?.fiscalEndDateAt,
    }
  }

  private _transformToPerson (person: ISiafRnfOutput['persons'][0]): IPerson {
    return {
      ...person,
      civility: person?.civility || '',
      // lastName: person?.lastName,
      // firstName: person?.firstName,
      // profession: person?.profession,
      // nationality: person?.nationality,
      // bornAt: person?.bornAt,
      bornPlace: person?.bornPlace || '',
      // isFounder: person?.isFounder,
      address: {
        label: person.address.dsStringValue || '',
        type: person.address.gouvAddress?.type || person.address.dsAddress?.type || '',
        streetAddress: person.address.gouvAddress?.street || person.address.dsAddress?.streetAddress || '',
        streetNumber: person.address.gouvAddress?.housenumber || person.address.dsAddress?.streetNumber || '',
        streetName: person.address.gouvAddress?.name || person.address.dsAddress?.streetName || '',
        postalCode: person.address.gouvAddress?.postcode || person.address.dsAddress?.postalCode || '',
        departmentName: person.address.dsAddress?.departmentName || '',
        cityName: person.address.dsAddress?.cityName || '',
        cityCode: person.address.dsAddress?.cityCode || '',
        departmentCode: person.address.dsAddress?.departmentCode || '',
        regionName: person.address.dsAddress?.regionName || '',
        regionCode: person.address.dsAddress?.regionCode || '',
      },
      email: person.email || '',
      phone: person.phone || '',
      createdAt: new Date(-1),
      updatedAt: new Date(-1),
    // role: person.role as PersonRoleKey,
    // entryDate: person.entryDate,
    // exitDate: person.exitDate
    }
  }

  private _transformSiafRnfToOrganismeDto (organisme: ISiafRnfOutput): IOrganismeOutputDto {
    return {
      idRnf: organisme.id,
      type: organisme.foundationType,
      title: organisme.title,
      email: organisme.email,
      phoneNumber: organisme.phone,
      declarationYears: organisme.declarationYears,
      dateDissolution: organisme.dissolved.dissolvedAt,
      dateCreation: organisme.originalCreatedAt,
      rnfJson: organisme,
      addressLabel: organisme.address.dsStringValue,
      siege: {
        coordinates: organisme?.address?.coordinates,
        prefecture: this._prefectureFn(organisme.address?.dsAddress?.postalCode ||
          organisme.address?.dsAddress?.postalCode),
        isVerified: !!(organisme.address?.dsAddress?.type || organisme.address?.gouvAddress),
      },
      websites: organisme?.websites?.join(','),
      objectDescription: organisme?.objectDescription,
      dueDate: organisme.dueDate,
      generalInterest: organisme.generalInterest,
      internationalAction: organisme.internationalAction,
      createdAt: organisme?.createdAt,
      updatedAt: organisme?.updatedAt,
      fiscalEndDateAt: organisme.fiscalEndDateAt,
      persons: organisme.persons.map(this._transformToPerson),
    } as IOrganismeOutputDto
  }

  async getOrganismeRnfFromAllServer(idRnf: string): Promise<IOrganismeOutput> {
    this.logger.verbose('getOrganismeRnfFromAllServer')
    const results = await Promise.allSettled([
      this.findOneOrThrow({ where: { idRnf } }),
      this.getFoundationFromSiaf(idRnf),
    ])
    const bn = this._getValueFromPromiseSettle('bn', results[0])
    const siaf = this._getValueFromPromiseSettle('siaf', results[1])

    return {
      bn: bn && this._transformRnfToOrganismeDto(bn),
      siaf: siaf && {
        ...this._transformSiafRnfToOrganismeDto(siaf),
        // TODO: A faire mieux pour le cas où la fondation n'est pas enregistré dans bn
        missingDeclarationYears: bn?.missingDeclarationYears || [],
      },
      type: typeCategorieOrganisme.rnf,
    }
  }

  private _transformRnaToOrganismeDto (organisme: Organisme): IOrganismeOutputDto {
    return {
      ...organisme,
      siege: {
        prefecture: this._prefectureFn(organisme?.addressPostalCode),
        isVerified: !!(organisme?.addressType),
      },
    }
  }

  private _transformSiafRnaToOrganismeDto (organisme: ISiafRnaOutput): IOrganismeOutputDto {
    const addressSiege = organisme.addresses[1]
    const addressGestion = organisme.addresses[0]

    return {
      idRna: organisme.id,
      type: 'CULTE',
      siret: organisme.siret,
      title: organisme.title,
      email: organisme.emails.join(', '),
      phoneNumber: organisme.phones.join(', '),
      dateDissolution: organisme.dissolved?.dissolvedAt,
      dateCreation: organisme.createdAt,
      rnaJson: organisme,
      addressLabel: addressSiege?.gouvAddress?.label,
      siege: {
        coordinates: addressSiege?.coordinates,
        prefecture: this._prefectureFn(addressSiege?.gouvAddress?.postcode || addressSiege?.dsAddress?.postalCode),
        isVerified: !!(addressSiege?.gouvAddress || addressSiege?.dsAddress),
      },
      gestion: {
        addressLabel: addressGestion?.gouvAddress?.label,
        coordinates: addressGestion?.coordinates,
        isVerified: !!(addressGestion?.gouvAddress || addressGestion?.dsAddress),
        prefecture: this._prefectureFn(addressGestion?.gouvAddress?.postcode || addressGestion?.dsAddress?.postalCode),
      },
      websites: organisme?.websites?.join(','),
      objectDescription: organisme?.objetSocial?.description,
      generalInterest: [...new Set(organisme?.objetSocial?.categories.flatMap(c => c.descriptions))].join(','),
      createdAt: organisme?.createdAt,
      updatedAt: organisme?.updatedAt,
    } as IOrganismeOutputDto
  }

  // TODO: A supprimer aprés la mise du hub pour les association
  private _transformSiafHubAssociationToOrganismeDto (organisme: ISiafAssociationOutput): IOrganismeOutputDto {
    const addressFn = (address: ISiafAssociationOutput['coordonnees']['adresse_siege']): string => {
      if (!address) {
        return null
      }
      type addressbuild = keyof ISiafAssociationOutput['coordonnees']['adresse_siege']
      const arrayAddressBuild1: addressbuild[] = ['num_voie', 'type_voie', 'voie']
      const addressStreetAddress = address
        ? arrayAddressBuild1.map((k) => address[k])
          .filter((address) => !!address)
          .join(' ')
        : null
      const arrayAddressBuild2: addressbuild[] = ['cp', 'commune']
      return address
        ? `${addressStreetAddress} ${arrayAddressBuild2
          .map((k) => address[k])
          .filter((address) => !!address)
          .join(' ')}`
        : null
    }

    const addressSiegeLabel = organisme.coordonnees?.adresse_siege?.label ||
      addressFn(organisme.coordonnees?.adresse_siege)
    const addressGestionLabel = organisme.coordonnees?.adresse_gestion?.label ||
    addressFn(organisme.coordonnees?.adresse_gestion)

    return {
      idRna: organisme.identite.id_rna,
      type: 'CULTE',
      siret: organisme.identite.siret,
      sigle: organisme.identite.sigle,
      title: organisme.identite.nom,
      email: organisme.coordonnees.courriel,
      phoneNumber: organisme.coordonnees.telephone,
      dateDissolution: new Date(organisme.identite.date_dissolution),
      dateCreation: new Date(organisme.identite.date_crea),
      rnaJson: organisme,
      addressLabel: addressSiegeLabel,
      siege: {
        isVerified: !!organisme.coordonnees?.adresse_siege?.type_voie,
        prefecture: this._prefectureFn(organisme.coordonnees?.adresse_siege?.cp),
      },
      gestion: {
        addressLabel: addressGestionLabel,
        isVerified: !!organisme.coordonnees?.adresse_gestion?.type_voie,
        prefecture: this._prefectureFn(organisme.coordonnees?.adresse_gestion?.cp),
      },
      websites: organisme.coordonnees.site_web,
      objectDescription: organisme.activites.objet,
      generalInterest: organisme.activites.domaine,
      createdAt: new Date(organisme?.identite?.date_crea),
      updatedAt: new Date(organisme?.identite.date_modif_rna),
    } as IOrganismeOutputDto
  }

  async getOrganismeRnaFromAllServer(idRna: string): Promise<IOrganismeOutput> {
    this.logger.verbose('getOrganismeRnfFromAllServer')
    const results = await Promise.allSettled([
      this.findOneOrThrow({ where: { idRna } }),
      this.getAssocationFromSiaf(idRna),
    ])
    const bn = this._getValueFromPromiseSettle('bn', results[0])
    const siaf = this._getValueFromPromiseSettle('siaf', results[1])
    const out = {
      bn: bn && this._transformRnaToOrganismeDto(bn),
      type: typeCategorieOrganisme.rna,
    } as IOrganismeOutput

    if (!siaf) {
      return {
        ...out,
        siaf: null,
      }
    }
    if ('identite' in siaf) {
      out.siaf = this._transformSiafHubAssociationToOrganismeDto(siaf as ISiafAssociationOutput)
    } else {
      out.siaf = this._transformSiafRnaToOrganismeDto(siaf as ISiafRnaOutput)
    }
    return out
  }
}
