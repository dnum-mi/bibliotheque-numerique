import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import {
  DependencyChecker,
} from '../dependency.types'
import { iDependencyCheckResult } from '@biblio-num/shared'

@Injectable()
export class HubDependency implements DependencyChecker {
  readonly name = 'hub' as const

  private readonly axios: AxiosInstance

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
    const timeout = this.config.get('HubTimeout')

    this.axios = axios.create({
      headers: {
        'X-API-KEY': `${this.config.get('hub').key}`,
        'Content-Type': 'application/json',
      },
      timeout: timeout * 1000,
    })
  }

  async check(): Promise<iDependencyCheckResult> {
    try {
      const url = this.config.get('hub').healthPath
      if (!url) {
        return {
          name: this.name,
          status: 'down',
          message: 'Hub health url not configured in env',
        }
      }

      const response = await this.axios.get(url)

      if (response.status === 200) {
        return {
          name: this.name,
          status: 'up',
          details: {
            status: response.status,
          },
        }
      }

      return {
        name: this.name,
        status: 'down',
        message: `HTTP ${response.status}`,
        details: {
          status: response.status,
        },
      }
    } catch (error) {
      this.logger.warn(`Hub dependency error: ${error.message}`)
      this.logger.axiosDebug(error)
      return {
        name: this.name,
        status: 'down',
        message: error.message,
      }
    }
  }
}
