import { registerAs } from '@nestjs/config'

export default registerAs('rnf', () => ({
  siafUrl: process.env.RNF_SIAF_API_URL,
  siafToken: process.env.RNF_SIAF_API_TOKEN,
}))
