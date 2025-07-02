import { registerAs } from '@nestjs/config'
import * as process from 'node:process'

export default registerAs('siafHub', () => ({
  url: process.env.SIAF_HUB_API_URL,
  key: process.env.SIAF_HUB_API_KEY,
  healthPath: process.env.SIAF_HUB_API_HEALTH_PATH || '',
}))
