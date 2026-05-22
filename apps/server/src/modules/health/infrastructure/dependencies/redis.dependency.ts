import { Injectable } from '@nestjs/common'
import { RedisService } from '@/shared/modules/redis/redis.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import {
  DependencyChecker,
} from '../dependency.types'
import { iDependencyCheckResult } from '@biblio-num/shared'

@Injectable()
export class RedisDependency implements DependencyChecker {
  readonly name = 'redis' as const

  constructor(
    private readonly redisService: RedisService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  isReady(): boolean {
    return this.redisService.redisClient?.status === 'ready'
  }

  async check(): Promise<iDependencyCheckResult> {
    try {
      const status = this.redisService.redisClient?.status

      if (status === 'ready') {
        return {
          name: this.name,
          status: 'up',
          details: { status },
        }
      }

      return {
        name: this.name,
        status: 'down',
        message: `Redis status: ${status}`,
        details: { status },
      }
    } catch (error) {
      this.logger.error('Redis health check failed')
      this.logger.error(error.message)

      return {
        name: this.name,
        status: 'down',
        message: error.message,
      }
    }
  }
}
