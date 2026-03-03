import { Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '@/shared/modules/logger/logger.service'

@Injectable()
export class RedisService {
  private readonly _redisClient: Redis

  constructor(
    private readonly logger: LoggerService,
    private configService: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name)

    this._redisClient = new Redis({
      host: this.configService.get('redis').host,
      db: this.configService.get('redis').index,
      password: this.configService.get('redis').password,
      port: this.configService.get('redis').port,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (attempt): number => {
        return Math.min(attempt * 2000, 30000)
      },
    })

    this._monitorRedis()
  }

  private _monitorRedis(): void {
    this._redisClient.on('error', (error: Error) => {
      this.logger.error(`Redis connection error: ${error.message}`)
    })

    this._redisClient.on('connect', () => {
      this.logger.log('Redis connected.')
    })

    this._redisClient.on('ready', () => {
      this.logger.log('Redis connection established.')
    })
  }

  get redisClient(): Redis {
    return this._redisClient
  }

  async checkAndSet(key: string, expiryInSeconds = 3600): Promise<boolean> {
    this.logger.verbose('checkAndSet')
    this.logger.debug(`key: ${key}, expiry: ${expiryInSeconds}`)

    const result = await this._redisClient.set(
      key,
      'true',
      'EX',
      expiryInSeconds,
      'NX',
    )

    return result === 'OK'
  }

  async deleteKey(key: string): Promise<number> {
    this.logger.verbose('deleteKey')
    this.logger.debug(`key: ${key}`)

    return this._redisClient.del(key)
  }
}
