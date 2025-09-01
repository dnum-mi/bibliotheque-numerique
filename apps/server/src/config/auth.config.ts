import { registerAs } from '@nestjs/config'

export default registerAs('auth', () => ({
  clientId: process.env.AUTH_CLIENT_ID || 'client_id',
  clientSecret: process.env.AUTH_CLIENT_SECRET || 'client_secret',
  redirectUri: process.env.AUTH_REDIRECT_URI || 'http://localhost:3000/login-callback',
  discoveryUrl: process.env.AUTH_DISCOVERY_URL || 'https://identite-sandbox.proconnect.gouv.fr',
  userinfoSignedResponseAlg: process.env.AUTH_USERINFO_SIGNED_RESPONSE_ALG || 'RS256',
  disableSso: process.env.AUTH_DISABLE_SSO === 'true' || false,
  jwtSecret: process.env.AUTH_JWT_SECRET,
  jwtExpireIn: process.env.AUTH_JWT_EXPIRE_IN || '1h',
  jwtRefreshExpireIn: process.env.AUTH_JWT_REFRESH_EXPIRE_IN || '7d',
  expirationTokenProconnect: process.env.AUTH_TOKEN_PROCONNECT_EXPIRE_IN || '5m',
  proConnectAuthTokenMaxAge: process.env.AUTH_PROCONNECT_TOKEN_MAX_AGE || 300000,
}))
