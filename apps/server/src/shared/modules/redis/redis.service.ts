import { Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '@/shared/modules/logger/logger.service'

@Injectable()
export class RedisService {
  private redisClient: Redis

  constructor(
    private readonly logger: LoggerService,
    private configService: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name)
    this.redisClient = new Redis({
      host: this.configService.get('redis').host,
      db: this.configService.get('redis').index,
      password: this.configService.get('redis').password,
      port: this.configService.get('redis').port,
    })
  }

  async checkAndSet(key: string, expiryInSeconds = 3600): Promise<boolean> {
    this.logger.verbose('checkAndSet')
    this.logger.debug(`key: ${key}, expiry: ${expiryInSeconds}`)
    const result = await this.redisClient.set(key, 'true', 'EX', expiryInSeconds, 'NX')
    return result === 'OK'
  }

  async getKey(key: string): Promise<string | null> {
    this.logger.verbose('getKey')
    this.logger.debug(`key: ${key}`)
    return this.redisClient.get(key)
  }

  async deleteKey(key: string): Promise<number> {
    this.logger.verbose('deleteKey')
    this.logger.debug(`key: ${key}`)
    return this.redisClient.del(key)
  }

  async initkeys(partern: string): Promise<void> {
    const keys = await this.redisClient.keys(partern)

    await Promise.all(keys.map(key => this.redisClient.del(key)))
  }
}
