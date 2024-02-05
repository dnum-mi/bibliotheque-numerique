import { registerAs } from '@nestjs/config'

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRY_PER_REQUEST_COUNT) || 5,
  maxLoadingRetryTime: parseInt(process.env.REDIS_MAX_LOADING_RETRY) || 20,
  password: process.env.REDIS_PASSWORD || 'redis',
}))
