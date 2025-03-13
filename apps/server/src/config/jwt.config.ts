import { registerAs } from '@nestjs/config'

export default registerAs('jwt', () => ({
  secret: process.env.AUTH_JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRE_IN || '15m',
}))
