import { Injectable } from '@nestjs/common'
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus'
import * as versionJson from '../../../version.json'

@Injectable()
export class VersionHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const version = versionJson.version
    const result: HealthIndicatorResult = this.getStatus(key, true, { version })

    if (version) {
      return result
    }

    throw new HealthCheckError('VersionCheck failed', result)
  }
}
