import { registerAs } from '@nestjs/config'

export default registerAs('auth', () => ({
  client_id: process.env.AUTH_CLIENT_ID || 'client_id',
  client_secret: process.env.AUTH_CLIENT_SECRET || 'client_secret',
  redirect_uri: process.env.AUTH_REDIRECT_URI || 'http://localhost:3000/login-callback',
  discovery_url: process.env.AUTH_DISCOVERY_URL || 'https://app-sandbox.moncomptepro.beta.gouv.fr',
  userinfo_signed_response_alg: process.env.AUTH_USERINFO_SIGNED_RESPONSE_ALG || 'RS256',
}))
