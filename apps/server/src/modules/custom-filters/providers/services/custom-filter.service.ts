import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { InjectRepository } from '@nestjs/typeorm'
import { CustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'
import { DossierSearchService } from '../../../dossiers/providers/dossier-search.service'
import {
  DossierSearchOutputDto,
  FieldSearchOutputDto,
  ICustomFilterStat,
  ITotal,
} from '@biblio-num/shared'
import { fromCustomFilterToHumanReadableFilter } from '@/shared/utils/common-search.utils'
import { fromMappingColumnArrayToLabelHash } from '../../../demarches/utils/demarche.utils'
import { FieldSearchService } from '@/modules/dossiers/providers/field-search.service'

@Injectable()
export class CustomFilterService extends BaseEntityService<CustomFilter> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(CustomFilter)
    protected readonly repo: Repository<CustomFilter>,
    private readonly dossierSearchService: DossierSearchService,
    private readonly fieldSearchService: FieldSearchService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  private _sumTotalsFromResult(
    customFilter: CustomFilter,
    labelHash: Record<string, string>,
    result: DossierSearchOutputDto | FieldSearchOutputDto,
  ): ITotal[] {
    const __add = (a: number, b: number): number => a + b
    return [
      {
        label: customFilter.groupByDossier
          ? 'Total des dossiers'
          : 'Total des champs',
        total: result.total,
      },
    ].concat(
      customFilter.totals?.map((totalKey) => ({
        label: labelHash[totalKey] || totalKey,
        total: result.data
          .map((element) => {
            const number = element?.[totalKey] || 0
            return number instanceof Array ? number.reduce(__add, 0) : number
          })
          .reduce(__add, 0),
      })) || [],
    )
  }

  async getStats(id: number, userId: number): Promise<ICustomFilterStat> {
    const customFilter = await this.findOneOrThrow({
      where: {
        user: { id: userId },
        id,
      },
      relations: ['demarche'],
    })
    const { name, filters } = customFilter
    const mch = fromMappingColumnArrayToLabelHash(
      customFilter.demarche.mappingColumns,
    )
    const humanReadableFilter = fromCustomFilterToHumanReadableFilter(
      filters,
      mch,
    )

    let result: DossierSearchOutputDto | FieldSearchOutputDto
    if (customFilter.groupByDossier) {
      result = await this.dossierSearchService.search(
        customFilter.demarche,
        customFilter,
        true,
      )
    } else {
      result = await this.fieldSearchService.search(
        customFilter.demarche,
        customFilter,
        true,
      )
    }

    return {
      customFilter: {
        id,
        name,
        filters: humanReadableFilter,
      },
      totals: this._sumTotalsFromResult(customFilter, mch, result),
      demarche: {
        id: customFilter.demarche.id,
        types: customFilter.demarche.types,
        dsId: customFilter.demarche.dsDataJson.number,
        title: customFilter.demarche.title,
      },
    }
  }
}
