import { Controller, Get } from '@nestjs/common'
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus'
import { ApiTags } from '@nestjs/swagger'
import { HealthCheckResult } from '@nestjs/terminus/dist/health-check/health-check-result.interface'
import { HealthIndicatorResult } from '@nestjs/terminus/dist/health-indicator'
import { PublicRoute } from '@/modules/users/providers/decorators/public-route.decorator'
import { LoggerService } from '@/shared/modules/logger/logger.service'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor (
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get()
  @PublicRoute()
  @HealthCheck()
  check (): Promise<HealthCheckResult> {
    this.logger.verbose('Health check')
    return this.health.check([(): Promise<HealthIndicatorResult> => this.db.pingCheck('database')])
  }
}
