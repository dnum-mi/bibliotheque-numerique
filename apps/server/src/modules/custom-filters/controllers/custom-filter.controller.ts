import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'
import { ICustomFilter, CreateCustomFilterDto, PatchCustomFilterDto } from '@biblio-num/shared'
import { PermissionsGuard, RequirePermissions } from '@/modules/roles/providers/permissions.guard'
import { PermissionName } from '@/shared/types/Permission.type'
import { CustomFilterService } from '@/modules/custom-filters/providers/services/custom-filter.service'
import {
  CurrentCustomFiltersInterceptor,
} from '@/modules/custom-filters/providers/interceptors/current-custom-filters.interceptor'
import { CustomFilters } from '@/modules/custom-filters/providers/decorator/current-custom-filters.decorator'
import { CurrentUserId } from '@/modules/users/decorators/current-user-id.decorator'
import { DeleteResult } from 'typeorm'

@ApiTags('Users')
@ApiTags('Filters')
@Controller('custom-filters')
@UseGuards(PermissionsGuard)
export class CustomFilterController {
  constructor(
    private readonly service: CustomFilterService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Post()
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async createOneFilter(@Body() dto: CreateCustomFilterDto, @CurrentUserId() userId: number): Promise<ICustomFilter> {
    this.logger.verbose('createOneFilter')
    return this.service.createAndSave({ ...dto, userId })
      .then(filter => {
        delete filter.userId
        return filter
      })
  }

  @Patch(':filterId')
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async updateOneFilter(@Body() dto: PatchCustomFilterDto,
                        @Param('filterId') filterId: number,
                        @CurrentUserId() userId: number): Promise<boolean> {
    this.logger.verbose('createOneFilter')
    return this.service.updateOrThrow({ id: filterId, userId }, dto)
  }

  @Get()
  @UseInterceptors(CurrentCustomFiltersInterceptor)
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getMyCustomFilters(
    @CustomFilters() filters: CustomFilter[],
  ): Promise<ICustomFilter[]> {
    this.logger.verbose('getMyCustomFilters')
    return filters
  }

  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  @Delete('/:filterId')
  async deleteOneFilter(@Param('filterId') filterId: number,
                        @CurrentUserId() userId: number): Promise<DeleteResult> {
    this.logger.verbose('deleteOneFilter')
    if (!Number(filterId)) {
      throw new BadRequestException('Filter id must be a number')
    }
    return this.service.remove({ id: filterId, userId })
  }
}
