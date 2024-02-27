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
  IRnaOutput,
  IRnfOutput,
  OrganismeType,
  eState,
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

@Injectable()
export class OrganismeService extends BaseEntityService<Organisme> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(Organisme) repo: Repository<Organisme>,
    protected readonly rnfService: RnfService,
    protected readonly rnaService: RnaService,
    protected readonly dossierService: DossierService,
  ) {
    super(repo, logger, OrganismeFieldTypeHash)
    this.logger.setContext(this.constructor.name)
  }

  private async _getOrCreateOrganismeCommun(
    id: string,
    key: 'idRnf' | 'idRna',
  ): Promise<number> {
    this.logger.debug(`from ${key}${id}`)
    const org = await this.repo.findOne({ where: { [key]: id } })
    if (org) {
      return org.id
    }
    return this.createAndSave({
      [key]: id,
      state: eState.queued,
    }).then((o) => o.id)
  }

  async getOrCreateOrganismeIdFromRna(idRna: string): Promise<number> {
    this.logger.verbose(`getOrCreateOrganismeIdFromRna ${idRna}`)
    return this._getOrCreateOrganismeCommun(idRna, 'idRna')
  }

  async getOrCreateOrganismeIdFromRnf(idRnf: string): Promise<number> {
    this.logger.verbose(`getOrCreateOrganismeIdFromRnf ${idRnf}`)
    return this._getOrCreateOrganismeCommun(idRnf, 'idRnf')
  }

  async updateOrganismeFromRnf(idRnf: string, raw: IRnfOutput): Promise<void> {
    this.logger.verbose(`updateOrganismeFromRnf ${idRnf}`)
    const __extractAddressField = (field: string): string =>
      raw.address[field] || ''
    await this.repo.update(
      { idRnf },
      {
        state: eState.uploaded,
        title: raw.title,
        dateCreation: new Date(raw.createdAt),
        type: raw.type,
        email: raw.email,
        phoneNumber: raw.phone,
        ...Object.fromEntries(
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
            __extractAddressField(field),
          ]),
        ),
        dateDissolution: raw.dissolvedAt,
        fiscalEndDateAt: raw.fiscalEndDateAt,
        rnfJson: raw,
      },
    )
  }

  async updateOrganismeFromRna(idRna: string, raw: IRnaOutput): Promise<void> {
    this.logger.verbose(`updateOrganismeFromRna ${idRna}`)
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
    await this.repo.update(
      {
        idRna,
      },
      {
        state: eState.uploaded,
        title: raw.nom,
        dateCreation: raw.date_creation,
        type: raw.reconnue_utilite_publique
          ? OrganismeType.ARUP
          : OrganismeType.CULTE,
        addressLabel,
        addressPostalCode: a?.code_postal,
        addressCityName: a?.commune,
        addressType: a?.type_voie,
        addressStreetAddress,
        addressStreetNumber: a?.numero_voie,
        addressStreetName: a?.libelle_voie,
        dateDissolution: raw.date_dissolution,
        rnaJson: raw,
      },
    )
  }

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
  ): Promise<PaginatedDto<IOrganisme>> {
    this.logger.verbose('listOrganisme')
    return this.paginate<IOrganisme>(dto, { state: eState.uploaded })
  }
}
