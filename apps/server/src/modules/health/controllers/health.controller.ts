import { Controller, Get } from '@nestjs/common'
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus'
import { ApiTags } from '@nestjs/swagger'
import { HealthCheckResult } from '@nestjs/terminus/dist/health-check/health-check-result.interface'
import { HealthIndicatorResult } from '@nestjs/terminus/dist/health-indicator'
import { PublicRoute } from '@/modules/users/providers/decorators/public-route.decorator'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { VersionHealthIndicator } from '@/modules/health/providers/version-health.indicator'
import { EnvironmentHealthIndicator } from '@/modules/health/providers/environment-health.indicator'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { DsHealthIndicator } from '@/modules/health/providers/ds-health.indicator'
import { HubHealthIndicator } from '@/modules/health/providers/hub-health.indicator'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private readonly logger: LoggerService,
    private versionIndicator: VersionHealthIndicator,
    private environmentIndicator: EnvironmentHealthIndicator,
    private dsHealth: DsHealthIndicator,
    private hubHealth: HubHealthIndicator,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  // This endpoint is used to check the health of the server,
  // Call by kubernetes status probe
  // Call by supervision
  @UsualApiOperation({
    summary: "Retourne l'état de santé du serveur.",
    method: 'GET',
    minimumRole: 'aucun',
    responseType: null,
  })
  @Get()
  @PublicRoute()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    this.logger.verbose('Health check')

    return this.health.check([
      (): Promise<HealthIndicatorResult> =>
        this.db.pingCheck('database'),
      (): Promise<HealthIndicatorResult> =>
        this.versionIndicator.isHealthy('version'),
      (): Promise<HealthIndicatorResult> =>
        this.environmentIndicator.isHealthy('environment'),
      (): Promise<HealthIndicatorResult> =>
        this.dsHealth.isHealthy('ds'),
      (): Promise<HealthIndicatorResult> =>
        this.hubHealth.isHealthy('hub'),
    ])
  }

  // This endpoint is used to check the service ds,
  // Call by client
  @UsualApiOperation({
    summary: 'Vérifie la connexion au service DS.',
    method: 'GET',
    minimumRole: 'aucun',
    responseType: null,
  })
  @Get('ds')
  @PublicRoute()
  ds(): Promise<HealthCheckResult> {
    this.logger.verbose('Server DS check')
    return this.health.check([
      (): Promise<HealthIndicatorResult> =>
        this.dsHealth.isHealthy('ds'),
    ])
  }

  // This endpoint is used to check the service siaf hub,
  // Call by client
  @UsualApiOperation({
    summary: 'Vérifie la connexion au service SIAF Hub.',
    method: 'GET',
    minimumRole: 'aucun',
    responseType: null,
  })
  @Get('hub')
  @PublicRoute()
  hub(): Promise<HealthCheckResult> {
    this.logger.verbose('Server Hub check')
    return this.health.check([
      (): Promise<HealthIndicatorResult> =>
        this.hubHealth.isHealthy('hub'),
    ])
  }

  // This endpoint is used to check the server's version and environment,
  // Call by client
  @UsualApiOperation({
    summary: 'Vérifie les informations du serveur.',
    method: 'GET',
    minimumRole: 'aucun',
    responseType: null,
  })
  @Get('info')
  @PublicRoute()
  info(): Promise<HealthCheckResult> {
    this.logger.verbose('Server info check')
    return this.health.check([
      (): Promise<HealthIndicatorResult> =>
        this.versionIndicator.isHealthy('version'),
      (): Promise<HealthIndicatorResult> =>
        this.environmentIndicator.isHealthy('environment'),
    ])
  }

  // This endpoint is used to check the liveliness of the server,
  // Call by kubernetes liveness probe
  @UsualApiOperation({
    summary: 'Vérifie la vivacité du serveur.',
    method: 'GET',
    minimumRole: 'aucun',
    responseType: null,
  })
  @Get('liveliness')
  @PublicRoute()
  liveliness(): string {
    this.logger.verbose('Liveliness check')
    return 'OK'
  }
}
