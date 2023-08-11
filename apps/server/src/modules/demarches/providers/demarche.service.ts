import { Injectable } from '@nestjs/common'
import { In, Repository } from 'typeorm'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import { PermissionName } from '../../../shared/types/Permission.type'
import { TConfig } from '../../../config/configuration'
import { Demarche } from '../objects/entities/demarche.entity'
import { User } from '../../users/entities/user.entity'
import { BaseEntityService } from '../../../shared/base-entity/base-entity.service'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere'

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

  async findByDsId (id: number): Promise<Demarche> {
    this.logger.verbose('findByDsId')
    return this.repo.createQueryBuilder('d')
      .where("d.\"dsDataJson\"->>'number' = :id", { id })
      .getOne()
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
}
