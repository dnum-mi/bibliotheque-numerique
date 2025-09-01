import { Injectable } from '@nestjs/common'
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus'

@Injectable()
export class EnvironmentHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const environment = process.env.RUN_ENV || 'development'
    const result: HealthIndicatorResult = this.getStatus(key, true, { environment })

    if (environment) {
      return result
    }

    throw new HealthCheckError('EnvironmentCheck failed', result)
  }
}
