import { registerAs } from '@nestjs/config'

export default registerAs('siaf', () => ({
  url: process.env.SIAF_API_URL,
  key: process.env.SIAF_API_KEY,
}))
