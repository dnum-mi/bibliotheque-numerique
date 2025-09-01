export interface LogElkFormat {
  level: 'log' | 'warn' | 'debug' | 'error' | 'verbose' | 'info'
  application: string
  timestamp: string,
  message: string,
  payload?: object
  context?: string
}
