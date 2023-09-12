import { Injectable, NotFoundException } from '@nestjs/common'
import { In, Repository } from 'typeorm'
import { LoggerService } from '../../../../shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import { PermissionName } from '../../../../shared/types/Permission.type'
import { TConfig } from '../../../../config/configuration'
import { Demarche } from '../../objects/entities/demarche.entity'
import { User } from '../../../users/entities/user.entity'
import { BaseEntityService } from '../../../../shared/base-entity/base-entity.service'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere'
import { IdentificationDemarcheKeys } from '@biblio-num/shared'
import { fixFieldsByIdentificationDictionary } from '../../../dossiers/objects/constante/fix-field.dictionnary'

@Injectable()
export class DemarcheService extends BaseEntityService<Demarche> {
  constructor (
    private configService: ConfigService,
    protected logger: LoggerService,
    @InjectRepository(Demarche) repo: Repository<Demarche>,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  async findById (id: number): Promise<Demarche> {
    this.logger.verbose('findById')
    return super.findOneById(id, {
      dossiers: true,
    })
  }

  async findByDsId (id: number, select?: (keyof Demarche)[]): Promise<Demarche> {
    this.logger.verbose('findByDsId')
    const query = await this.repo.createQueryBuilder('d')
      .where("d.\"dsDataJson\"->>'number' = :id", { id })
    if (select) {
      query.select(select)
    }
    return query.getOne()
  }

  async findWithPermissions (user: User, filter: FindOptionsWhere<Demarche> = {}): Promise<Demarche[]> {
    this.logger.verbose('findWithPermissions')
    const query = {
      ...filter,
    }
    const ruleIds = this.getRulesFromUserPermissions(user)
    if (ruleIds) {
      query.id = In(ruleIds)
    }
    return super.findWithFilter(query)
  }

  withPermissions (user: User, filter: Demarche): boolean {
    this.logger.verbose('findOneWithPermissions')
    const ruleIds = this.getRulesFromUserPermissions(user)
    if (!ruleIds) {
      return true
    }
    if (ruleIds.length > 0 && ruleIds.some(ruleId => ruleId === filter.id)) {
      return true
    }
    return false
  }

  public getRulesFromUserPermissions (user: User): number[] | void {
    this.logger.verbose('getRulesFromUserPermissions')
    const { roles } = user
    let demarcheIds: number[] = []
    for (const role of roles) {
      if (role.name === this.configService.get<TConfig['defaultAdmin']['roleName']>('defaultAdmin.roleName')) {
        return
      }
      const permissionAccessDemarche = role.permissions.find((p) => p.name === PermissionName.ACCESS_DEMARCHE)
      if (permissionAccessDemarche) {
        demarcheIds = demarcheIds.concat(permissionAccessDemarche?.options?.demarcheIds || [])
      }
    }
    return demarcheIds
  }

  async updateIdentificationDemarche (id: number, identification: IdentificationDemarcheKeys | null): Promise<void> {
    const demarche = await this.findById(id)
    if (!demarche) throw new NotFoundException(`demarche ${id} not found`)
    const { mappingColumns, identification: identificationOrigin } = demarche

    const mappingEntries = fixFieldsByIdentificationDictionary[identification || identificationOrigin]

    await this.repo.update(
      { id },
      {
        mappingColumns: identification !== undefined || mappingEntries
          ? (
            identification
              ? mappingColumns.concat(mappingEntries)
              : mappingColumns.filter(mapping => !(mappingEntries.map(entry => entry.id)).includes(mapping.id))
          )
          : mappingColumns,
        identification,
      },
    )
  }
}
