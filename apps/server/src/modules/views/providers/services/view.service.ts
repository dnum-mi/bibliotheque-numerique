import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { InjectRepository } from '@nestjs/typeorm'
import { fromMappingColumnArrayToLabelHash } from '../../../demarches/utils/demarche.utils'
import { ITotal } from '@biblio-num/shared'
import { DossierSearchOutputDto } from '@/modules/dossiers/objects/dto/dossier-search-output.dto'
import { FieldSearchOutputDto } from '@/modules/dossiers/objects/dto/fields/field-search-output.dto'
import { fromCustomFilterToHumanReadableFilter } from '@/shared/pagination/utils/search-dictionnaries.const'
import { ViewStatsOutputDto } from '@/modules/views/objects/dtos/view-stats-output.dto'
import { View } from '@/modules/views/objects/entities/view.entity'
import { ProjectionSearchService } from '@/modules/projection/services/projection-search/projection-search.service'

@Injectable()
export class ViewService extends BaseEntityService<View> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(View)
    protected readonly repo: Repository<View>,
    protected readonly projectionSearch: ProjectionSearchService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  private _sumTotalsFromResult(
    view: View,
    labelHash: Record<string, string>,
    result: DossierSearchOutputDto | FieldSearchOutputDto,
  ): ITotal[] {
    const __add = (a: number, b: number): number => a + b

    const __toNumber = (val: unknown): number => {
      if (val === null || val === undefined) return 0
      if (typeof val === 'number') return val
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return 0
    }

    return [
      {
        label: view.groupByDossier
          ? 'Total des dossiers'
          : 'Total des champs',
        total: __toNumber(result.total),
      },
    ].concat(
      view.totals?.map((totalKey) => ({
        label: labelHash[totalKey] || totalKey,
        total: result.data
          .map((element) => {
            const number = element?.[totalKey] || 0
            return number instanceof Array ? number.map(__toNumber).reduce(__add, 0) : __toNumber(number)
          })
          .reduce(__add, 0),
      })) || [],
    )
  }

  async getStats(
    id: number,
    userId: number,
  ): Promise<ViewStatsOutputDto> {
    const view = await this.findOneOrThrow({
      where: {
        user: { id: userId },
        id,
      },
      relations: ['demarche'],
    })
    const { name, filters } = view
    const mch = fromMappingColumnArrayToLabelHash(
      view.demarche.mappingColumns,
    )
    const humanReadableFilter = fromCustomFilterToHumanReadableFilter(
      filters,
      mch,
    )

    let result: DossierSearchOutputDto | FieldSearchOutputDto
    if (view.groupByDossier) {
      result = await this.projectionSearch.searchDossier(
        view.demarche,
        view,
        true,
      )
    } else {
      result = await this.projectionSearch.searchField(
        view.demarche,
        view,
        true,
      )
    }

    return {
      view: {
        id,
        name,
        filters: humanReadableFilter,
      },
      totals: this._sumTotalsFromResult(view, mch, result),
      demarche: {
        id: view.demarche.id,
        types: view.demarche.types,
        identification: view.demarche.identification,
        dsId: view.demarche.dsDataJson.number,
        title: view.demarche.title,
        dsPublishedAt: view.demarche.dsDataJson.datePublication,
        dsCreatedAt: view.demarche.dsDataJson.dateCreation,
      },
    }
  }
}
