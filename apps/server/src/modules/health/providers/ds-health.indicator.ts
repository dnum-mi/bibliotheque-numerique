import { Injectable } from '@nestjs/common'
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'

@Injectable()
export class DsHealthIndicator extends HealthIndicator {
  axios: AxiosInstance

  constructor(
    protected logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    super()
    this.axios = axios.create({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer token=${this.config.get('ds').apiToken}`,
      },
    })
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.config.get('ds').health) {
      this.logger.warn('DS API health check is not configured')
      return this.getStatus(key, true)
    }

    try {
      const query = {
        query: '{ __typename }',
      }

      const proxyUrl = this.config.get('httpProxy')
      let proxy

      if (proxyUrl) {
        const { hostname, port, protocol } = new URL(proxyUrl)
        proxy = {
          host: hostname,
          port: parseInt(port, 10),
          protocol: protocol.replace(':', ''),
        }
      }

      const url = this.config.get('ds').apiUrl

      const response = await this.axios.post(url, query, { proxy })
      this.logger.verbose(`DS health check: ${response.status} - ${url}`)
      return this.getStatus(key, response.status === 200)
    } catch (error) {
      const code = error.response?.status

      this.logger.error(`DS API error: ${code}`)
      this.logger.error(error.message)
      return this.getStatus(key, false)
    }
  }
}
