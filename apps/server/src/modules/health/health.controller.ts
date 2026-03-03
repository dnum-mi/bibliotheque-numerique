import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'

import { PublicRoute } from '@/modules/users/providers/decorators/public-route.decorator'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'

import { RedisDependency } from '@/modules/health/infrastructure/dependencies/redis.dependency'
import { DsDependency } from '@/modules/health/infrastructure/dependencies/ds.dependency'
import { HubDependency } from '@/modules/health/infrastructure/dependencies/hub.dependency'
import { S3Dependency } from '@/modules/health/infrastructure/dependencies/s3.dependency'
import * as versionJson from '../../version.json'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly redis: RedisDependency,
    private readonly ds: DsDependency,
    private readonly hub: HubDependency,
    private readonly s3: S3Dependency,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @UsualApiOperation({
    summary: "Retourne l'état de santé du serveur.",
    method: 'GET',
    minimumRole: 'aucun',
    responseType: null,
  })
  @Get()
  @PublicRoute()
  // TODO: typé le retour dans la lib et partager avec le front
  async readiness(): Promise<unknown> {
    this.logger.verbose('Health check')

    const results = await Promise.all([
      this.redis.check(),
      this.ds.check(),
      this.hub.check(),
      this.s3.check(),
    ])

    const dependencies = Object.fromEntries(
      results.map((r) => [r.name, r]),
    )

    const status = results.every((r) => r.status === 'up')
      ? 'ok'
      : 'degraded'

    return {
      status,
      timestamp: new Date().toISOString(),
      dependencies,
      info: {
        version: versionJson.version,
        environment: this.config.get('runEnv'),
      },
    }
  }

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
