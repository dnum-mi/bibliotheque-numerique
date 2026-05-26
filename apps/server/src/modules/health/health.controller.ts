import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PublicRoute } from '@/modules/users/providers/decorators/public-route.decorator'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { iHealthOutput } from '@biblio-num/shared'
import { HealthService } from '@/modules/health/providers/health.service'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly logger: LoggerService,
    private readonly service: HealthService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @UsualApiOperation({
    summary: 'Retourne le dernier état de santé sur serveur.',
    method: 'GET',
    minimumRole: 'aucun',
    responseType: null,
  })
  @Get('last')
  @PublicRoute()
  async lastHealthSnapshot(): Promise<iHealthOutput> {
    return this.service.lastHealthSnapshot()
  }

  @UsualApiOperation({
    summary: "Trigger les dependencies et retourne l'état de santé du serveur.",
    method: 'GET',
    minimumRole: 'aucun',
    responseType: null,
  })
  @Get()
  @PublicRoute()
  async readiness(): Promise<iHealthOutput> {
    return this.service.readiness()
  }

  @UsualApiOperation({
    summary: 'Vérifie la vivacité du serveur.',
    method: 'GET',
    minimumRole: 'aucun',
    responseType: null,
  })
  @Get('liveness')
  @PublicRoute()
  liveness(): string {
    this.logger.verbose('Liveliness check')
    return 'OK'
  }
}
