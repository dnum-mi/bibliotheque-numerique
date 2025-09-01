import { registerAs } from '@nestjs/config'

export default registerAs('jwt', () => ({
  secret: process.env.JWT_URL_SECRET || 'secret',
  expiresIn: process.env.JWT_URL_EXPIRE_IN || '15m',
}))
