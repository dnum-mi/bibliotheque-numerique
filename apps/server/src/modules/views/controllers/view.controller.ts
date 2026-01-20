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
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Roles } from '@biblio-num/shared'
import { CurrentUserId } from '@/modules/users/providers/decorators/current-user-id.decorator'
import { DeleteResult } from 'typeorm'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { ViewService } from '@/modules/views/providers/services/view.service'
import { ViewOutputDto } from '@/modules/views/objects/dtos/view-output.dto'
import { CurrentViewsInterceptor } from '@/modules/views/providers/interceptors/current-views.interceptor'
import { Views } from '@/modules/views/providers/decorator/current-views.decorator'
import { ViewStatsOutputDto } from '@/modules/views/objects/dtos/view-stats-output.dto'
import { PatchViewDto } from '@/modules/views/objects/dtos/patch-view.dto'
import { View } from '@/modules/views/objects/entities/view.entity'

@ApiTags('Users', 'Vues')
@Controller('views')
export class ViewController {
  constructor(
    private readonly service: ViewService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get()
  @UsualApiOperation({
    summary: 'Retourne les vues de l\'utilisateur courant.',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: ViewOutputDto,
    isArray: true,
  })
  @Role(Roles.instructor)
  @UseInterceptors(CurrentViewsInterceptor)
  async getMyViews(
    @Views() views: View[],
  ): Promise<ViewOutputDto[]> {
    this.logger.verbose('getMyViews')
    return views
  }

  @Delete('/:viewId')
  @ApiOperation({
    summary: 'Supprimer une vue.',
    description: 'Supprimer une vue. Seulement une vue que l\'utilisateur possède.',
  })
  @UsualApiOperation({
    summary: 'Supprimer une vue.',
    method: 'DELETE',
    minimumRole: Roles.instructor,
    supplement: 'Seulement un affichage que l\'utilisateur possède.',
    responseType: DeleteResult,
  })
  @Role(Roles.instructor)
  async deleteOneView(
    @Param('viewId') viewId: number,
    @CurrentUserId() userId: number,
  ): Promise<DeleteResult> {
    this.logger.verbose('deleteOneView')
    if (!Number(viewId)) {
      throw new BadRequestException('View id must be a number')
    }
    return this.service.remove({ id: viewId, userId })
  }

  @Get(':viewId/stats')
  @UsualApiOperation({
    summary: 'Retourne les statistiques d\'une vue.',
    method: 'GET',
    minimumRole: Roles.instructor,
    supplement: 'Seulement une vue que l\'utilisateur possède.',
    responseType: ViewStatsOutputDto,
  })
  @Role('any')
  async getStatistique(
    @Param('viewId') viewId: number,
    @CurrentUserId() userId: number,
  ): Promise<ViewStatsOutputDto> {
    return this.service.getStats(viewId, userId)
  }

  @UsualApiOperation({
    summary: 'Modifie une vue.',
    method: 'PATCH',
    minimumRole: Roles.instructor,
    supplement: 'Seulement une vue que l\'utilisateur possède.',
    responseType: null,
  })
  @Patch(':viewId')
  @Role(Roles.instructor)
  async updateOneView(
    @Body() dto: PatchViewDto,
    @Param('viewId') viewId: number,
    @CurrentUserId() userId: number,
  ): Promise<boolean> {
    this.logger.verbose('updateOneView')
    return this.service.updateOrThrow({ id: viewId, userId }, dto)
  }
}
