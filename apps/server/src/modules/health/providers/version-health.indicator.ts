import { Injectable } from '@nestjs/common'
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus'
import * as packageJson from '../../../../package.json'

@Injectable()
export class VersionHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const version = packageJson.version
    const result: HealthIndicatorResult = this.getStatus(key, true, { version })

    if (version) {
      return result
    }

    throw new HealthCheckError('VersionCheck failed', result)
  }
}
