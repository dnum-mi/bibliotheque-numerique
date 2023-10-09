import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CreateCustomFilterDto, ICustomFilter, ICustomFilterStat } from '@biblio-num/shared'

import { PermissionsGuard, RequirePermissions } from '../../roles/providers/permissions.guard'
import { CustomFilterService } from '../providers/services/custom-filter.service'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { CurrentDemarcheInterceptor } from '../../demarches/providers/interceptors/current-demarche.interceptor'
import { PermissionName } from '../../../shared/types/Permission.type'
import { CurrentUserId } from '../../users/decorators/current-user-id.decorator'
import { CurrentDemarche } from '../../demarches/providers/decorators/current-demarche.decorator'
import { CurrentCustomFiltersInterceptor } from '../providers/interceptors/current-custom-filters.interceptor'
import { CustomFilters } from '../providers/decorator/current-custom-filters.decorator'
import { CustomFilter } from '../objects/entities/custom-filter.entity'
import { Demarche } from '../../demarches/objects/entities/demarche.entity'

@ApiTags('Users')
@ApiTags('Filters')
@UseInterceptors(CurrentDemarcheInterceptor)
@UseGuards(PermissionsGuard)
@Controller('custom-filters/demarche/:demarcheId')
export class CustomFilterDemarcheController {
  constructor(
    private readonly service: CustomFilterService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Post()
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async createOneFilter(@Body() dto: CreateCustomFilterDto,
                        @CurrentUserId() userId: number,
                        @CurrentDemarche() demarche: Demarche): Promise<ICustomFilter> {
    this.logger.verbose('createOneFilter')
    return this.service.createAndSave({ ...dto, userId, demarcheId: demarche.id })
      .then(filter => {
        delete filter.userId
        return filter
      })
  }

  @Get()
  @UseInterceptors(CurrentCustomFiltersInterceptor)
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getMyCustomFiltersByDemarche(
    @CustomFilters() filters: CustomFilter[],
  ): Promise<ICustomFilter[]> {
    this.logger.verbose('getMyCustomFilters')
    return filters
  }

  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  @Get(':filterId/stats')
  async getStatistique(
    @Param('filterId') filterId: number,
    @CurrentUserId() userId: number,
    @CurrentDemarche() demarche: Demarche,
  ): Promise<ICustomFilterStat> {
    return this.service.getStats(filterId, userId, demarche)
  }
}
