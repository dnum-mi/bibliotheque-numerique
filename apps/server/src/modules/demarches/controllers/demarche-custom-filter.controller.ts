import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import {
  ICustomFilter,
} from '@biblio-num/shared-utils'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CurrentDemarcheInterceptor } from '../../demarches/providers/interceptors/current-demarche.interceptor'
import { CurrentUserId } from '@/modules/users/providers/decorators/current-user-id.decorator'
import { CurrentDemarche } from '../../demarches/providers/decorators/current-demarche.decorator'
import { Demarche } from '../../demarches/objects/entities/demarche.entity'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { CustomFilterService } from '@/modules/custom-filters/providers/services/custom-filter.service'
import {
  CurrentCustomFiltersInterceptor,
} from '@/modules/custom-filters/providers/interceptors/current-custom-filters.interceptor'
import { CustomFilters } from '@/modules/custom-filters/providers/decorator/current-custom-filters.decorator'
import { CustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'
import { CreateCustomFilterDto } from '@/modules/custom-filters/objects/dtos/create-custom-filter.dto'
import { CustomFilterOutputDto } from '@/modules/custom-filters/objects/dtos/custom-filter-output.dto'

@ApiTags('Users')
@ApiTags('Filters')
@UseInterceptors(CurrentDemarcheInterceptor)
@Controller('demarches/:demarcheId/custom-filters')
export class DemarcheCustomFilterController {
  constructor(
    private readonly service: CustomFilterService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Post()
  @Role('any')
  async createOneFilter(
    @Body() dto: CreateCustomFilterDto,
    @CurrentUserId() userId: number,
    @CurrentDemarche() demarche: Demarche,
  ): Promise<CustomFilterOutputDto> {
    this.logger.verbose('createOneFilter')
    return this.service
      .createAndSave({ ...dto, userId, demarcheId: demarche.id })
      .then((filter) => {
        delete filter.userId
        return filter
      })
  }

  @Get()
  @Role('any')
  @UseInterceptors(CurrentCustomFiltersInterceptor)
  async getMyCustomFiltersByDemarche(
    @CustomFilters() filters: CustomFilter[],
  ): Promise<CustomFilterOutputDto[]> {
    this.logger.verbose('getMyCustomFilters')
    return filters
  }
}
