import { registerAs } from '@nestjs/config'

export default registerAs('log', () => ({
  log: process.env.LOG_LEVEL_LOG ? process.env.LOG_LEVEL_LOG === 'true' : true,
  warn: process.env.LOG_LEVEL_WARN ? process.env.LOG_LEVEL_WARN === 'true' : true,
  error: process.env.LOG_LEVEL_ERROR ? process.env.LOG_LEVEL_ERROR === 'true' : true,
  verbose: process.env.LOG_LEVEL_VERBOSE ? process.env.LOG_LEVEL_VERBOSE === 'true' : false,
  debug: process.env.LOG_LEVEL_DEBUG ? process.env.LOG_LEVEL_DEBUG === 'true' : false,
}))
