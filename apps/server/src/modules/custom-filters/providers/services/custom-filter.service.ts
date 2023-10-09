import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { InjectRepository } from '@nestjs/typeorm'
import { CustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'
import { DossierSearchService } from '../../../dossiers/providers/dossier-search.service'
import { ICustomFilterStat, UserFriendlyFilter, ITotal } from '@biblio-num/shared'
import { humanReadableFilter } from '@/shared/utils/common-search.utils'
import { fromMappingColumnArrayToLabelHash } from '../../../demarches/utils/demarche.utils'
import { Demarche } from '../../../demarches/objects/entities/demarche.entity'

@Injectable()
export class CustomFilterService extends BaseEntityService<CustomFilter> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(CustomFilter)
    protected readonly repo: Repository<CustomFilter>,
    private readonly dossierSearchService: DossierSearchService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  async getStats (id: number, userId: number, demarche: Demarche): Promise<ICustomFilterStat> {
    const customFilter = await this.findOneOrThrow({
      where: {
        user: { id: userId },
        demarcheId: demarche.id,
        id,
      },
    })

    const { name, filters: filtersFromCustom } = customFilter

    const mch = fromMappingColumnArrayToLabelHash(demarche.mappingColumns)

    const filters: UserFriendlyFilter[] = filtersFromCustom
      ? Object.entries(filtersFromCustom).map(([key, value]) => {
        return ({
          label: mch[key] || key,
          value: humanReadableFilter(value),
        })
      })
      : []

    // const stat = await this.dossierSearchService.statistiques(demarcheId, customFilter)
    const stat = await this.dossierSearchService.statistics(demarche, customFilter)
    const totals:ITotal[] = [
      {
        label: 'Total des dossiers',
        total: `${stat.nb}`,
      },
    ]

    return {
      customFilter: {
        id,
        name,
        filters,
      },
      totals,
      demarche: {
        id: demarche.id,
        dsId: demarche.dsDataJson.number,
        title: demarche.title,
      },
    }
  }
}
