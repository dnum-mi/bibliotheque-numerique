import { registerAs } from '@nestjs/config'

export default registerAs('ds', () => ({
  host: process.env.DS_API_HOST,
  api: process.env.DS_API_URL,
  token: process.env.DS_API_TOKEN,
  adminToken: process.env.ADMIN_TOKEN,
}))
