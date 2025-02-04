import { registerAs } from '@nestjs/config'

export default registerAs('auth', () => ({
  client_id: process.env.AUTH_CLIENT_ID,
  client_secret: process.env.AUTH_CLIENT_SECRET,
  redirect_uri: process.env.AUTH_REDIRECT_URI,
  discovery_url: process.env.AUTH_DISCOVERY_URL,
}))
