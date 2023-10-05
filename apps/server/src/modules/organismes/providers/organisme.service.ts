import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
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
  PaginatedOrganismeDto,
  PaginationDto,
} from '@biblio-num/shared'
import { buildFilterQuery } from '@/shared/utils/common-search.utils'
import { OrganismeFieldTypeHash } from '@/modules/organismes/objects/const/organisme-field-type-hash.const'

@Injectable()
export class OrganismeService extends BaseEntityService<Organisme> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(Organisme) repo: Repository<Organisme>,
    protected readonly rnfService: RnfService,
    protected readonly rnaService: RnaService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  async associateOrganismeFromRnf(idRnf: string): Promise<number> {
    this.logger.verbose(`associateOrganismeFromRnf ${idRnf}`)
    const raw: IRnfOutput = await this.rnfService.getFoundation(idRnf)
    if (!raw) {
      throw new Error('No association found with this RNF.')
    }
    const __extractAddressField = (field: string): string | null =>
      raw.address[field] || null
    const upsert = await this.repo.upsert(
      {
        idRnf,
        title: raw.title,
        dateCreation: raw.createdAt,
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
        rnfJson: raw,
      },
      {
        conflictPaths: ['idRnf'],
        skipUpdateIfNoValuesChanged: false,
      },
    )
    return upsert.identifiers[0].id
  }

  async associateOrganismeFromRna(idRna: string): Promise<number> {
    this.logger.verbose(`associateOrganismeFromRna ${idRna}`)
    const raw: IRnaOutput = await this.rnaService.getAssociation(idRna)
    if (!raw) {
      throw new Error('No association found with this RNA.')
    }
    const a = raw.adresse_siege || null
    const addressStreetAddress = a
      ? `${a?.numero_voie} ${a?.type_voie} ${a?.libelle_voie}`
      : null
    const addressLabel = a
      ? `${addressStreetAddress} ${a?.code_postal} ${a?.commune}`
      : null
    const upsert = await this.repo.upsert(
      {
        idRna,
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
      {
        conflictPaths: ['idRna'],
        skipUpdateIfNoValuesChanged: false,
      },
    )
    return upsert.identifiers[0].id
  }

  async listOrganisme(
    dto: PaginationDto<IOrganisme>,
  ): Promise<PaginatedOrganismeDto> {
    this.logger.verbose('listOrganisme')
    const query = this.repo.createQueryBuilder('o')
    if (dto.filters) {
      query.where(buildFilterQuery(dto.filters, OrganismeFieldTypeHash))
    }
    const count = await query.getCount()
    if (dto.sorts?.length) {
      dto.sorts.forEach(sort => {
        query.addOrderBy(`o.${sort.key}`, sort.order)
      })
    }
    query.limit(dto.perPage || 20)
    query.offset((dto.perPage * (dto.page - 1)) || 0)
    if (dto.columns?.length) {
      query.select(dto.columns.map(c => `o.${c}`).concat(['o.id']))
    }
    return query.getMany().then((data) => {
      return {
        data,
        total: count,
      } as PaginatedOrganismeDto
    })
  }
}
