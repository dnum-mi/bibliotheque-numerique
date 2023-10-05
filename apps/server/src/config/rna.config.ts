import { registerAs } from '@nestjs/config'

export default registerAs('rna', () => ({
  url: process.env.RNA_API_URL,
  token: process.env.RNA_API_TOKEN,
  recipient: process.env.RNA_API_RECIPIENT,
}))
