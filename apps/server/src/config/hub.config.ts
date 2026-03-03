import { registerAs } from '@nestjs/config'

export default registerAs('hub', () => ({
  url: process.env.SIAF_HUB_API_URL,
  key: process.env.SIAF_HUB_API_KEY,
  healthPath: process.env.SIAF_HUB_API_HEALTH_PATH || '',
}))
