import { registerAs } from '@nestjs/config'

export default registerAs('bull', () => ({
  removeOnFail: process.env.BULL_JOB_REMOVE_ON_FAIL === 'true',
  removeOnSuccess: process.env.BULL_JOB_REMOVE_ON_SUCCESS === 'true',
  retryAttempts: parseInt(process.env.BULL_JOB_RETRY_ATTEMPTS) || 3,
  retryDelay: parseInt(process.env.BULL_JOB_RETRY_DELAY) || 10000,
  retryExponentiel: process.env.BULL_JOB_RETRY_DELAY_TYPE === 'exponentiel',
}))
