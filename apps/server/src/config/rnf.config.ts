import { registerAs } from '@nestjs/config'

export default registerAs('rnf', () => ({
  url: process.env.RNF_API_URL,
  siafUrl: process.env.RNF_SIAF_API_URL,
  siafToken: process.env.RNF_SIAF_API_TOKEN,
}))
