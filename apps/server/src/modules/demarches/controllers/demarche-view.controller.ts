import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CurrentDemarcheInterceptor } from '../../demarches/providers/interceptors/current-demarche.interceptor'
import { CurrentUserId } from '@/modules/users/providers/decorators/current-user-id.decorator'
import { CurrentDemarche } from '../../demarches/providers/decorators/current-demarche.decorator'
import { Demarche } from '../../demarches/objects/entities/demarche.entity'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { ViewService } from '@/modules/views/providers/services/view.service'
import {
  CurrentViewsInterceptor,
} from '@/modules/views/providers/interceptors/current-views.interceptor'
import { CreateViewDto } from '@/modules/views/objects/dtos/create-view.dto'
import { ViewOutputDto } from '@/modules/views/objects/dtos/view-output.dto'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { Views } from '@/modules/views/providers/decorator/current-views.decorator'
import { View } from '@/modules/views/objects/entities/view.entity'

@ApiTags('Demarches', 'Vues')
@UseInterceptors(CurrentDemarcheInterceptor)
@Controller('demarches/:demarcheId/views')
export class DemarcheViewController {
  constructor(
    private readonly service: ViewService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Post()
  @UsualApiOperation({
    summary: 'Créé une nouvelle vue.',
    method: 'POST',
    minimumRole: 'aucun',
    responseType: ViewOutputDto,
  })
  @Role('any')
  async createOneView(
    @Body() dto: CreateViewDto,
    @CurrentUserId() userId: number,
    @CurrentDemarche() demarche: Demarche,
  ): Promise<ViewOutputDto> {
    this.logger.verbose('createOneView')
    return this.service
      .createAndSave({ ...dto, userId, demarcheId: demarche.id })
      .then((view) => {
        delete view.userId
        return view
      })
  }

  @Get()
  @UsualApiOperation({
    summary: 'Retourne les vues.',
    supplement:
      'Retourne les vues pour chaque démarche de l’utilisateur.',
    method: 'POST',
    minimumRole: 'aucun',
    responseType: ViewOutputDto,
    isArray: true,
  })
  @Role('any')
  @UseInterceptors(CurrentViewsInterceptor)
  async getMyViewsByDemarche(
    @Views() views: View[],
  ): Promise<ViewOutputDto[]> {
    this.logger.verbose('getMyViews')
    return views
  }
}
