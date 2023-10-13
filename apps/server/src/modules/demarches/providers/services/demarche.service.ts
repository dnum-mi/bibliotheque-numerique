import { Injectable, NotFoundException } from '@nestjs/common'
import { Repository } from 'typeorm'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Demarche } from '../../objects/entities/demarche.entity'
import { User } from '../../../users/entities/user.entity'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere'
import { fixFieldsByIdentificationDictionary } from '../../../dossiers/objects/constante/fix-field.dictionnary'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
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

  async findById(id: number): Promise<Demarche> {
    this.logger.verbose('findById')
    return super.findOneById(id, {
      dossiers: true,
    })
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

  async findWithPermissions(
    user: User,
    filter: FindOptionsWhere<Demarche> = {},
  ): Promise<Demarche[]> {
    this.logger.verbose('findWithPermissions')
    const query = {
      ...filter,
    }
    // eslint-disable-next-line
    // @ts-ignore TODO: role refacto
    // const ruleIds = this.getRulesFromUserPermissions(user)
    // if (ruleIds) {
    //   query.id = In(ruleIds)
    // }
    return super.findWithFilter(query)
  }

  // eslint-disable-next-line
  // @ts-ignore TODO: role refacto
  withPermissions(): boolean {
    this.logger.verbose('findOneWithPermissions')
    return true
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
}
