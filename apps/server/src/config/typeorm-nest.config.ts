import { registerAs } from '@nestjs/config'
import { options } from '../../database/typeorm.config'
import { NodeEnvs } from '../shared/types/node-env.enum'

export default registerAs('database', () => {
  switch (process.env.NODE_ENV) {
  case NodeEnvs.TestUnit:
    return {
      ...options(),
      database: 'biblio-num-unit',
      synchronize: true,
    }
  case NodeEnvs.TestE2E:
    return {
      ...options(),
      database: 'biblio-num-e2e',
      synchronize: true,
    }
  default:
    return {
      ...options(),
      synchronize: process.env.TYPEORM_FORCE_SYNCHRONIZE === 'true',
    }
  }
})
