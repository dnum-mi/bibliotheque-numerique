import { Injectable, NotFoundException } from '@nestjs/common'
import { In, Repository } from 'typeorm'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Demarche } from '../../objects/entities/demarche.entity'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { InjectRepository } from '@nestjs/typeorm'
import { fixFieldsByIdentificationDictionary } from '../../../dossiers/objects/constante/fix-field.dictionnary'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

import {
  isBelowSuperAdmin,
  Roles,
  IRole,
} from '@biblio-num/shared'

import { FindManyOptions } from 'typeorm/find-options/FindManyOptions'
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere'
import { SmallDemarcheOutputDto } from '@/modules/demarches/objects/dtos/small-demarche-output.dto'
import { UpdateDemarcheDto } from '@/modules/demarches/objects/dtos/update-demarche.dto'

@Injectable()
export class DemarcheService extends BaseEntityService<Demarche> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(Demarche) repo: Repository<Demarche>,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  async findByDsId(id: number, select?: (keyof Demarche)[]): Promise<Demarche> {
    this.logger.verbose('findByDsId')
    const query = await this.repo
      .createQueryBuilder('d')
      .where('d."dsDataJson"->>\'number\' = :id', { id })
    if (select) {
      query.select(select)
    }
    return query.getOne()
  }

  async findAllSmallDemarche(): Promise<SmallDemarcheOutputDto[]> {
    return this.findMultipleSmallDemarche({}, { label: Roles.superadmin, options: null })
  }

  async findMultipleSmallDemarche(
    filter: FindManyOptions<Demarche> = {},
    role: IRole,
  ): Promise<SmallDemarcheOutputDto[]> {
    return this.findMultipleDemarche(
      { ...filter, select: ['id', 'title', 'dsDataJson', 'types', 'identification'] },
      role,
    ).then((demarches) => {
      return demarches.map((d) => ({
        id: d.id,
        title: d.title,
        types: d.types,
        dsId: d.dsDataJson?.number,
        identification: d.identification,
        dsCreatedAt: d.dsDataJson.dateCreation,
        dsPublishedAt: d.dsDataJson.datePublication,
      }))
    })
  }

  async findMultipleDemarche(
    filter: FindManyOptions<Demarche> = {},
    role: IRole = { label: Roles.superadmin, options: null },
  ): Promise<Demarche[]> {
    this.logger.verbose('findMultipleDemarche')
    if (isBelowSuperAdmin(role.label)) {
      const allowedIds: FindOptionsWhere<Demarche> = {
        id: In(Object.keys(role.options)),
      }
      filter.where = [...[filter.where ?? []].flat(), allowedIds]
    }
    return this.repo.find(filter)
  }

  async updateDemarche(
    id: number,
    dto: UpdateDemarcheDto | null,
  ): Promise<void> {
    const demarche = await this.findOneOrThrow({ where: { id } })
    const updateQuery: QueryDeepPartialEntity<Demarche> = {}
    if (!demarche) throw new NotFoundException(`demarche ${id} not found`)
    if (dto.types) {
      updateQuery.types = dto.types
    }
    const { mappingColumns, identification: identificationOrigin } = demarche
    const mappingEntries =
      fixFieldsByIdentificationDictionary[dto.identification] || []
    const mappingEntriesOrigin =
      fixFieldsByIdentificationDictionary[identificationOrigin] || []
    if (dto.identification !== undefined) {
      updateQuery.mappingColumns = mappingColumns
        .filter((mc) => !mappingEntriesOrigin.find((mc2) => mc2.id === mc.id))
        .concat(mappingEntries)
    }
    updateQuery.identification = dto.identification
    await this.repo.update({ id }, updateQuery)
  }

  async softDeleteDemarche(id: number): Promise<void> {
    const demarche = await this.findOneOrThrow({ where: { id } })
    if (!demarche) throw new NotFoundException(`demarche ${id} not found`)
    await this.repo.softDelete(id)
  }
}
