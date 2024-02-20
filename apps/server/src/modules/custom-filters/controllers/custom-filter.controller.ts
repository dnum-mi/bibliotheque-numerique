import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'
import { ICustomFilterStat, Roles } from '@biblio-num/shared'
import { CustomFilterService } from '@/modules/custom-filters/providers/services/custom-filter.service'
import {
  CurrentCustomFiltersInterceptor,
} from '@/modules/custom-filters/providers/interceptors/current-custom-filters.interceptor'
import { CustomFilters } from '@/modules/custom-filters/providers/decorator/current-custom-filters.decorator'
import { CurrentUserId } from '@/modules/users/providers/decorators/current-user-id.decorator'
import { DeleteResult } from 'typeorm'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { PatchCustomFilterDto } from '@/modules/custom-filters/objects/dtos/patch-custom-filter.dto'
import { CustomFilterOutputDto } from '@/modules/custom-filters/objects/dtos/custom-filter-output.dto'

@ApiTags('Users')
@ApiTags('Filters')
@Controller('custom-filters')
export class CustomFilterController {
  constructor(
    private readonly service: CustomFilterService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get()
  @Role(Roles.instructor)
  @UseInterceptors(CurrentCustomFiltersInterceptor)
  async getMyCustomFilters(
    @CustomFilters() filters: CustomFilter[],
  ): Promise<CustomFilterOutputDto[]> {
    this.logger.verbose('getMyCustomFilters')
    return filters
  }

  @Delete('/:filterId')
  @Role(Roles.instructor)
  async deleteOneFilter(
    @Param('filterId') filterId: number,
    @CurrentUserId() userId: number,
  ): Promise<DeleteResult> {
    this.logger.verbose('deleteOneFilter')
    if (!Number(filterId)) {
      throw new BadRequestException('Filter id must be a number')
    }
    return this.service.remove({ id: filterId, userId })
  }

  @Get(':filterId/stats')
  @Role('any')
  async getStatistique(
    @Param('filterId') filterId: number,
    @CurrentUserId() userId: number,
  ): Promise<ICustomFilterStat> {
    return this.service.getStats(filterId, userId)
  }

  @Patch(':filterId')
  @Role(Roles.instructor)
  async updateOneFilter(
    @Body() dto: PatchCustomFilterDto,
    @Param('filterId') filterId: number,
    @CurrentUserId() userId: number,
  ): Promise<boolean> {
    this.logger.verbose('createOneFilter')
    return this.service.updateOrThrow({ id: filterId, userId }, dto)
  }
}
