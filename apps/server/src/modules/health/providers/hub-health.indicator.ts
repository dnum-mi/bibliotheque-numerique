import { Injectable } from '@nestjs/common'
import {
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'
import { LoggerService } from '@/shared/modules/logger/logger.service'

@Injectable()
export class HubHealthIndicator extends HealthIndicator {
  axios: AxiosInstance

  constructor(
    protected logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    super()
    this.logger.setContext(this.constructor.name)
    this.axios = axios.create({
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': `${this.config.get('siafHub.key')}`,
      },
    })
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.config.get('siafHub.healthPath')) {
      this.logger.warn('SIAF Hub URL is not configured')
      return this.getStatus(key, true)
    }

    const url = this.config.get('siafHub.url') + this.config.get('siafHub.healthPath')

    try {
      const response = await this.axios.get(url)
      this.logger.verbose(`Hub health check: ${response.status} - ${url}`)

      return this.getStatus(key, response.status === 200)
    } catch (error) {
      const code = error.response?.status

      this.logger.error(`Hub API error: ${code}`)
      this.logger.error(error.message)
      return this.getStatus(key, false)
    }
  }
}
