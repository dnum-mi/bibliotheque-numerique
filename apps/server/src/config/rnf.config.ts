import { registerAs } from '@nestjs/config'

export default registerAs('rnf', () => ({
  url: process.env.RNF_API_URL,
}))
