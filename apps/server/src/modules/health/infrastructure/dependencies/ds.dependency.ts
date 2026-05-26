import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import {
  DependencyChecker,
} from '../dependency.types'
import { iDependencyCheckResult } from '@biblio-num/shared'

@Injectable()
export class DsDependency implements DependencyChecker {
  readonly name = 'ds' as const

  private readonly axios: AxiosInstance
  private readonly url: string
  private readonly proxy?: {
    host: string;
    port: number;
    protocol: string;
  }

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
    this.url = this.config.get('ds').apiUrl
    this.axios = axios.create({
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer token=${this.config.get('ds').apiToken}`,
      },
    })
    const proxyUrl = this.config.get('httpProxy')
    if (proxyUrl) {
      const { hostname, port, protocol } = new URL(proxyUrl)
      this.proxy = {
        host: hostname,
        port: parseInt(port, 10),
        protocol: protocol.replace(':', ''),
      }
    }
  }

  async check(): Promise<iDependencyCheckResult> {
    try {
      if (!this.url) {
        return {
          name: this.name,
          status: 'down',
          message: 'DS API URL not configured',
        }
      }
      const query = {
        query: '{ __typename }',
      }
      const response = await this.axios.post(this.url, query, {
        proxy: this.proxy,
      })

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
      const code = error?.response?.status
      this.logger.warn(`DS dependency error: ${code ?? error.message}`)
      this.logger.axiosDebug(error)
      return {
        name: this.name,
        status: 'down',
        message: error.message,
        details: {
          status: code,
        },
      }
    }
  }
}
