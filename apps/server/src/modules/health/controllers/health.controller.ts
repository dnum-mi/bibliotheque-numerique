import { Controller, Get } from '@nestjs/common'
import { HealthCheck, HealthCheckService, HttpHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus'
import { ApiTags } from '@nestjs/swagger'
import { HealthCheckResult } from '@nestjs/terminus/dist/health-check/health-check-result.interface'
import { HealthIndicatorResult } from '@nestjs/terminus/dist/health-indicator'
import { PublicRoute } from '@/modules/users/providers/decorators/public-route.decorator'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor (
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @PublicRoute()
  @HealthCheck()
  check (): Promise<HealthCheckResult> {
    return this.health.check([(): Promise<HealthIndicatorResult> => this.db.pingCheck('database')])
  }
}
